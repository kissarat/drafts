class Language {
  constructor(lexemes = Lexemes.Labiak, syntax = mathSyntax) {
    this.lexemes = lexemes
    this.gas = 60
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
      const r = this.parseRule(g, ...this.syntax.get('St'))
      if ((r instanceof Array && r.length > 0) || 'string' === typeof r) {
        output.push(r)
      }
      else if (true !== r) {
        throw new Error('Rule not found ' + JSON.stringify(r))
      }
    }
    return output
  }

  parseRule(g, name, ...rule) {
    if (this.gas-- <= 0) {
      throw new Error('Out of gas', rule)
    }
    let c
    let nodes = []
    let isValidRule = true
    let i = 0
    loop: for (; rule[i] && (c = g.at(0)); i++) {
      let part = rule[i]
      let node
      const lexemeName = part instanceof Array ? part[0] : part
      const isLexeme = this.lexemes.has(lexemeName)
      let isValid = false
      if (isLexeme) {
        isValid = lexemeName === (c instanceof Array ? part[0] : part)
        node = c
        g.index++
      }
      else {
        if ('string' === typeof part) {
          part = this.syntax.get(part)
        }
        if (part instanceof Array) {
          node = this.parseRule(g, ...part)
          isValid = node && (true === node || node.length > 0)
        }
        else {
          throw new Error('Rule is not array ' + JSON.stringify({part, i, rule}))
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