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
