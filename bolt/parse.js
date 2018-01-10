const rules = {
  group(nodes) {
    for (const node of nodes) {
      if (!node.check(node)) {
        return false
      }
    }
    return nodes
  },

  or(nodes) {
    for (const node of nodes) {
      if (node.check(node)) {
        return [node]
      }
    }
  },

  opt(nodes) {
    for (const node of nodes) {
      if (node.check(node)) {
        return [node]
      }
    }
  }
}

class Language {
  constructor(lexemes = Lexemes.Labiak, syntax = mathSyntax) {
    this.lexemes = lexemes
    this.gas = 60
    syntax = 'string' === typeof syntax ? parseBackusNaur(scan(syntax)) : syntax
    this.syntax = new Map()
    for (const [assign, name, [...rule]] of syntax) {
      this.syntax.set(name.toString(), new Rule(...rule))
    }
  }

  scan(g) {
    return scan(g, this.lexemes)
  }

  getRule(string) {

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

  parseRule(g, name, ...rules) {
    if (this.gas-- <= 0) {
      throw new Error('Out of gas', rules)
    }
    const c = g.at(0)
    const isLexeme = this.lexemes.has(name)
    if (isLexeme) {
      return
    }
    let node
    if ('string' === typeof c) {
      node = this.syntax.get(c)
      for(const rule of rules) {

      }
    }
    switch (name) {
      case 'group':
        break
      case 'or':
        break
      case 'opt':
        break
      default:

    }
  }

  parseToJSON(g) {
    return JSON.stringify(this.parse(g), null, '\t')
  }
}

class Node {

}

class ArrayNode extends Node {


}

const lang = new Language()