class Lexeme extends Rule {
  replace(s) {
    return s.slice(this.first.length)
  }
}

class StringLexeme extends Lexeme {
  match(s) {
    if (s.indexOf(this.first) === 0) {
      return this
    }
  }

  toString() {
    return this.type
  }
}

class Token extends String {
  get type() {
    return this.constructor.name
  }

  replace(s) {
    return s.slice(this.length)
  }
}

class Atom extends Token {
  eval(context) {
    const key = this.toString()
    return key in context ? context[key] : this
  }
}

class Number extends Token {
  eval() {
    return +this.toString()
  }
}

const tokens = {
  Atom,
  Integer: class Integer extends Number {},
  Real: class Real extends Number {},
}

class RegExpLexeme extends Lexeme {
  match(s) {
    const m = this.first.exec(s)
    if (m) {
      const tokenClass = tokens[this.type]
      const raw = m.length > 1 ? m[1] || m[2] || m[3] || m[4] || m[5] || m[0] : m[0]
      return tokenClass ? new tokenClass(raw) : new Lexeme(this.type, raw)
    }
  }
}

class Vocabulary extends Map {
}

class LexicalVocabulary extends Vocabulary {
  setString(key, value) {
    return this.set(key, new StringLexeme(key, value))
  }

  setRegExp(key, value) {
    return this.set(key, new RegExpLexeme(key, value))
  }

  *parse(string) {
    string = string
        .replace(/\s+/g, ' ')
    next: for (let i = 0; string.length > 0; i++) {
      assert(i < 3000, 'Out of gas' + string)
      for (const [key, lexeme] of this) {
        const m = lexeme.match(string)
        if (m) {
          string = m.replace(string)
          if ('Space' !== key) {
            yield m
          }
          continue next
        }
      }
      throw new Error(`Unknown lexeme at ${i}: ` + string.slice(i, i + 10))
    }
  }

  parseToJSON(string) {
    return Array.from(this.parse(string))
        .map(r => r instanceof StringLexeme ? r.toString() : [r.type, r.first])
  }
}
