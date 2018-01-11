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
    if ('atom' === this.type) {
      console.log('visit', g.index, this.first)
    }
    const result = this.visitCheck(language, g)
    if ('atom' === this.type) {
      console.log(this.first, g.index, result)
    }
    if (!result) {
      g.index = index
    }
    return result
  }
}

class GroupRule extends Rule {
  constructor(...args) {
    super('group', ...args)
  }

  visitCheck(language, g) {
    for (let i = 1; i < this.length; i++) {
      if (!this[i].check(language, g)) {
        return false
      }
    }
    return true
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
      return x.check(language, g)
    }
    else if (this.first === c.type) {
      g()
      return true
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
      if (this[i].check(language, g)) {
        return true
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
    if (!this.first.check(language, g)) {
      return true
    }
    for (let i = 2; i < this.length; i++) {
      if (!this[i].check(language, g)) {
        return false
      }
    }
    return true
  }
}

class RepeatRule extends Rule {
  constructor(...args) {
    super('repeat', ...args)
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
