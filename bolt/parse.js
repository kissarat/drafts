class Language {
  constructor(lexemes = Lexemes.Labiak, syntax = mathSyntax) {
    this.lexemes = lexemes
    syntax = 'string' === typeof syntax ? parseBackusNaur(scan(syntax)) : syntax
    this.syntax = new Map()
    for (const [assign, name, [...rule]] of syntax) {
      this.syntax.set(name, rule)
    }
  }

  scan(g) {
    return scan(g, this.lexemes)
  }

  parse(g) {
    if ('string' === typeof g) {
      g = generator(this.scan(g))
    }
    let output = []
    g.index = 0
    while (g.can()) {
      let r
      // for (const rule of this.syntax) {
      //   r = this.parseRule(g, ...rule)
      //   if (r) {
      //     output.push(r)
      //     break
      //   }
      // }
      // for (let i = 0; i < 1; i++) {
      r = this.parseRule(g, ...this.syntax.get('St'))
      if (r) {
        output.push(r)
        // break
      }
      // }
      if (!r) {
        throw new Error('Rule not found')
      }
    }
    return output
  }

  parseRule(g, name, ...rule) {
    let c
    let nodes = []
    let isValidRule = true
    let i = 0
    loop: for (; rule[i] && (c = g.at(0)); i++) {
      let part = rule[i]
      let node
      let isValid = false
      if ('string' === typeof part) {
        const token = this.lexemes.get(part)
        if (token) {
          isValid = token
          node = 'string' === typeof token ? part : c
          g.index++
        }
        else {
          part = this.syntax.get(part)
          node = this.parseRule(g, ...part)
          isValid = node && (true === node || node.length > 0)
        }
      }
      if (isValid && true !== node) {
        nodes.push(node)
      }
      switch (name) {
        case 'group':
          if (!isValid) {
            isValidRule = false
            break loop
          }
          break

        case 'opt':
          break

        case 'or':
          isValidRule = isValid
          if (isValid) {
            break loop
          }
      }
    }
    if ('opt' === name && nodes.length === 0) {
      // g.index = index
      return true
    }
    if (!isValidRule) {
      // g.index = index
      return []
    }
    // return nodes
    return 1 === nodes.length ? nodes[0] : nodes
  }

  parseToJSON(g) {
    return JSON.stringify(this.parse(g), null, '\t')
  }
}

const lang = new Language()