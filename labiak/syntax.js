class Syntax {
  constructor(rules = {}) {
    this.rules = rules
  }

  define(...args) {
    const rule = new Rule(...args)
    this.rules[rule.id] = rule
  }

  each(cb) {
    for (const id in this.rules) {
      cb(this.rules[id], id)
    }
  }

  map(cb) {
    const rules = []
    this.each(r => rules.push(cb(r)))
    return rules
  }

  link(immediate = false) {
    this.each(rule => rule.link(this, immediate))
  }

  depth() {
    const result = {}
    this.each((rule, id) => result[id] = rule.depth())
    return result
  }

  parse(string) {
    const next = generator(scan(string))
    return this.rules.expression.parse(next)
  }

  build(tokens) {
    const next = generator(tokens)
    let array
    while ((array = parse(next)) && array.length > 0) {
      this.define(array)
    }
    this.link()
  }

  static create(source) {
    const syntax = new Syntax()
    syntax.fromString(source)
    return syntax
  }

  copyRules(rules = {}) {
    this.each((rule, id) => rules[id] = rule)
    return rules
  }

  toJSON() {
    const rules = this.copyRules()
    for (const id in rules) {
      rules[id] = rules[id].toJSON()
    }
    return rules
  }

  toString() {
    const strings = []
    this.each(function (rule) {
      const s = rule.toString()
      strings.push(`${rule.id} = ${s} ;`)
    })
    return strings.join('\n')
  }

  fromString(string) {
    this.build(scan(string))
  }

  isEqual(syntax) {
    if (Object.keys(this.rules).length !== Object.keys(syntax.rules).length) {
      return false
    }
    for (const id in this.rules) {
      const left = this.rules[id]
      const right = syntax.rules[id]
      if (!(right && left.isEquals(right))) {
        return false
      }
    }
    return true
  }
}
