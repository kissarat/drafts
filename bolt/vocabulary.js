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

class RegExpLexeme extends Lexeme {
  match(s) {
    const m = this.first.exec(s)
    if (m) {
      return new Lexeme(this.type, m.length > 1 ? m[1] || m[2] || m[3] || m[4] || m[5] || m[0] : m[0])
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
