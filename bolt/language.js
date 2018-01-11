function assert(truth, message, obj) {
  if (!truth) {
    if (obj) {
      message += ' ' + JSON.stringify(obj)
    }
    throw new Error(message)
  }
}

class Rule extends Array {
  get type() {
    return this[0]
  }

  get first() {
    return this[1]
  }

  get second() {
    return this[2]
  }

  get last() {
    return this[this.length - 1]
  }

  get isMultiple() {
    return this.length > 2
  }

  toAlternative() {
    return this.isMultiple
        ? new OrRule(this.first)
        : new OrRule(this)
  }

  is(other) {
    return this.type === other.type
  }

  toJSON() {
    const result = [this.type]
    for (let i = 1; i < this.length; i++) {
      const r = this[i]
      if (r instanceof AtomRule) {
        result.push(r.toString())
      }
      else if (r instanceof Rule) {
        result.push(r.toJSON())
      }
      else {
        throw new Error('Unknown type ' + r)
      }
    }
    return result
  }

  toString(pretty) {
    const json = this.toJSON()
    return pretty ? JSON.stringify(json, null, '  ') : JSON.stringify(json)
  }

  check(language, g) {
    const index = g.index
    if (g.gas-- < 0) {
      throw new Error('Out of gas')
    }
    if (language.debug && 'atom' === this.type) {
      console.log('visit', g.index, this.first)
    }
    let result = this.visitCheck(language, g)
    if (language.debug && 'atom' === this.type) {
      console.log(this.first, g.index, result)
    }
    if (!result) {
      g.index = index
      return false
    }
    if (result.constructor === Array) {
      result = result.filter(r => true !== r)
      if (1 === result.length) {
        return result[0]
      }
      // else if (2 === result.length) {
      //   return [result[0], ...result[1]]
      // }
    }
    return result
  }
}

class GroupRule extends Rule {
  constructor(...args) {
    super('group', ...args)
  }

  visitCheck(language, g) {
    const results = []
    for (let i = 1; i < this.length; i++) {
      const result = this[i].check(language, g)
      if (result) {
        results.push(result)
      }
      else {
        return false
      }
    }
    return results
  }
}

class AtomRule extends Rule {
  constructor(...args) {
    super('atom', ...args)
  }

  toString() {
    return this.first
  }

  visitCheck(language, g) {
    if (!g.can()) {
      return false
    }
    const c = g.at(0)
    const x = language.syntax.get(this.first)
    // console.log('TYPE', c.type, this.first, x)
    if (x) {
      let result = x.check(language, g)
      if (result) {
        if (result.constructor === Array) {
          const name = this.first
          const rule = language.syntax.rules[name]
          if (rule) {
            result = rule.isNode ? new rule(...result) : rule(result)
          }
          else {
            result.unshift(name)
          }
        }
        return result
      }
    }
    else if (this.first === c.type) {
      g()
      return c
    }
    return false
  }
}

class OrRule extends Rule {
  constructor(...args) {
    super('or', ...args)
  }

  visitCheck(language, g) {
    for (let i = 1; i < this.length; i++) {
      const result = this[i].check(language, g)
      if (result) {
        return result
      }
    }
    return false
  }
}

class OptRule extends Rule {
  constructor(...args) {
    super('opt', ...args)
  }

  visitCheck(language, g) {
    const results = []
    const index = g.index
    for (let i = 1; i < this.length; i++) {
      const result = this[i].check(language, g)
      if (result) {
        results.push(result)
      }
      else {
        g.index = index
        return true
      }
    }
    return results
  }
}

class RepeatRule extends Rule {
  constructor(...args) {
    super('repeat', ...args)
  }

  visitCheck(language, g) {
    const results = []
    loop: while (true) {
      const index = g.index
      for (let i = 1; i < this.length; i++) {
        const result = this[i].check(language, g)
        if (result) {
          results.push(result)
        }
        else {
          g.index = index
          break loop
        }
      }
    }
    if (results.length > 0) {
      return results
    }
    return true
  }
}

class AssignRule extends Rule {
  constructor(...args) {
    super('assign', ...args)
  }
}

class Language {
  constructor(lexemes, syntax) {
    this.lexemes = lexemes
    this.syntax = syntax
  }

  parse(string) {
    const g = this.lexemes.parse(string)
    return this.syntax.parse(g)
  }
}
