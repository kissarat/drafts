class Rule {
  constructor(id, type, rules) {
    switch (arguments.length) {
      case 1:
        type = id[2][0]
        rules = id[2].slice(1)
        id = id[1]
        break

      case 2:
        rules = type.slice(1)
        type = type[0]
        break
    }
    this.id = id
    this.type = type
    this.rules = rules.reverse().map((r, i) => r instanceof Array ? new Rule(id + '.' + i, r) : r)
  }

  at(i) {
    const rule = this.rules[i]
    if ('string' === typeof rule && (rule in this.syntax.rules)) {
      return this.syntax.rules[rule]
    }
    return rule
  }

  parse(count, depth = 0) {
    if ('string' === typeof count) {
      count = generator(scan(count))
    }
    if (depth > 50) {
      throw new Error('Too deep syntax ' + depth)
    }
    let nodes = []
    const isAlt = 'or' === this.type
    while (count.current) {
      for (let rule of this.rules) {
        if (rule in syntax.rules) {
          rule = syntax.rules[rule]
        }
        let r
        if (rule === count.current) {
          r = count.current
        }
        else if (rule instanceof Rule) {
          r = rule.parse(count, depth + 1)
        }
        if (r) {
          nodes.push(r)
          if (isAlt) {
            return nodes
          }
        }
        else if (!isAlt) {
          return nodes
        }
      }
    }
    return nodes
  }

  get syntax() {
    let parent = this
    while (parent.parent) {
      parent = parent.parent
    }
    return parent
  }

  link(parent, immediate) {
    this.parent = parent
    for (let i = 0; i < this.rules.length; i++) {
      let rule = this.rules[i]
      if ('string' === typeof rule) {
        if (immediate && (rule = parent.rules[rule])) {
          this.rules[i] = rule
        }
      }
      else if (rule instanceof Rule) {
        rule.link(this)
      }
    }
  }

  branches() {
    return this.rules.filter(r => r instanceof Rule)
  }

  depth(i = 0) {
    return i > 50 ? 1 : Math.max(...this.rules.map(r => r instanceof Rule ? r.depth(i + 1) + 1 : 1))
  }

  get isDefined() {
    return this.id.indexOf('.') < 0
  }

  toJSON(depth = 0) {
    if (depth < 50) {
      const nodes = [this.type]
      for (let i = this.rules.length - 1; i >= 0; i--) {
        let rule = this.rules[i]
        if (rule instanceof Rule) {
          rule = rule.isDefined ? rule.id : rule.toJSON(depth + 1)
        }
        nodes.push(rule)
      }
      return nodes
    }
    console.error('Too deep')
  }

  toString(depth = 0) {
    if (depth < 50) {
      let strings = []
      for (let i = this.rules.length - 1; i >= 0; i--) {
        let rule = this.rules[i]
        if (rule instanceof Rule) {
          rule = rule.isDefined ? rule.id : rule.toString()
        }
        if (/^[^\w]$/.test(rule)) {
          rule = `"${rule}"`
        }
        strings.push(rule)
      }
      strings = strings.join('or' === this.type ? ' | ' : ' ')
      switch (this.type) {
        case 'opt':
          return `[${strings}]`

        case 'group':
          return 0 === depth ? strings : `(${strings})`

        case 'repeat':
          return `{${strings}}`

        default:
          return strings
      }
    }
    else {
      console.error('Too deep')
    }
  }

  isEquals(rule) {
    if (this.type === rule.type && this.rules.length === rule.rules.length) {
      for (let i = this.rules.length - 1; i >= 0; i--) {
        const left = this.rules[i]
        const right = rule.rules[i]
        const equal = right && left instanceof Rule
          ? left.isEquals(right)
          : left === right
        if (!equal) {
          return false
        }
      }
      return true
    }
    return false
  }
}
