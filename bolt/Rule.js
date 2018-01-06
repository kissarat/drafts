class Rule {
  constructor(type, ...args) {
    this.type = type
    this.args = args
  }
  
  parse(syntax, it, depth = 0) {
    if (depth > 50) {
      throw new Error('Too deep syntax ' + depth)
    }
    let nodes = []
    const isAlt = 'or' === this.type
    while (!it.done) {
      for (let rule of this.args) {
        if (rule in syntax) {
          rule = syntax[rule]
        }
        let r
        if (rule === it.current) {
          r = it.current
        }
        else if (rule instanceof Rule) {
          r = rule.parse(it, depth + 1)
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
}
