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
    for(let i = 1; i < this.length; i++) {
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

  parse(nodes) {
    const results = []
    for (const rule of this) {
      const result = rule.parse(rule)
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
}

class OrRule extends Rule {
  constructor(...args) {
    super('or', ...args)
  }
}

class OptRule extends Rule {
  constructor(...args) {
    super('opt', ...args)
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
