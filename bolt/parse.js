class Language {
  constructor(lexemes = LanguageLexems, syntax = mathSyntax) {
    this.lexems = lexemes
    this.syntax = 'string' === typeof syntax ? parseBackusNaur(scan(syntax)) : syntax
  }

  parse(g) {
    if ('string' === typeof g) {
      g = generator(scan(g, this.lexems))
    }
    let output = []
    g.index = 0
    while(g.can()) {
      let r
      for (const name in this.syntax) {
        r = this.parseRule(g, ...this.syntax[name])
        if (r) {
          g.index++
          output.push(r)
          break
        }
      }
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
    // const index = g.index
    loop: for (; rule[i] && (c = g.at(0)); i++) {
      let part = rule[i]
      const isLexeme = 'string' === typeof part && part in this.lexems
      if ('string' === typeof part && !isLexeme) {
        part = this.syntax[part]
      }
      if (!part) {
        throw new Error('No rule ' + rule[i])
      }
      let node
      if (isLexeme) {
        const token = this.lexems[part]
        node = 'string' === typeof token ? part : c
      }
      else {
        node = this.parseRule(g, ...part)
      }
      let isValid = isLexeme || true === node || node.length > 0
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
    return 1 === nodes.length ? nodes[0] : nodes
  }

  parseToJSON(g) {
    return JSON.stringify(this.parse(g), null, '\t')
  }
}

const lang = new Language()