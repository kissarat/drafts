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
}

class GroupRule extends Rule {
  constructor(...args) {
    super('group', ...args)
  }

  check(g) {
    for (let i = 1; i < this.length && g.can(); i++) {
      if (!this[i].check(g)) {
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

  check(g) {
    if (this.type === g.at(0).type) {
      return 1
    }
    return 0
  }
}

class OrRule extends Rule {
  constructor(...args) {
    super('or', ...args)
  }

  check(g) {
    for (let i = 1; i < this.length && g.can(); i++) {
      const v = this[i].check(g)
      if (v) {
        return v
      }
    }
    return false
  }
}

class OptRule extends Rule {
  constructor(...args) {
    super('opt', ...args)
  }

  check(g) {
    if (!this.first.check(g)) {
      return true
    }
    for (let i = 2; i < this.length && g.can(); i++) {
      if (!this[i].check(g)) {
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
