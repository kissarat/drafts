class LabiakLexicalVocabulary extends LexicalVocabulary {
  constructor(...args) {
    super(...args)
    this.setRegExp('Space', /^\s+/m)
    this.setRegExp('Real', /^\d+.\d+/)
    this.setRegExp('Integer', /^\d+/)
    this.setRegExp('Atom', /^[a-z]\w*/i)
    this.setString('Assign', '=')
    this.setString('Add', '+')
    this.setString('Sub', '-')
    this.setString('Mult', '*')
    this.setString('Div', '*')
    this.setString('LeftRound', '(')
    this.setString('RightRound', ')')
  }
}

class LabiakSyntaticVocabulary extends SyntaticVocabulary {
  constructor(...args) {
    super(...args)
    this.define()
  }

  get root() {
    return this.get('St')
  }

  check(g) {
    return this.root.check(g)
  }
}

LabiakSyntaticVocabulary.string = `
  Number = Integer | Real ;
  Addictive = Add | Sub ;
  Op = Addictive | Mult | Div ;
  Exp = Number Op Number | Exp Op Number | LeftRound Exp RightRound ;
  Define = Atom Assign Exp ;
  St = Number | Exp | Define ;
`

class Labiak extends Language {
  constructor() {
    super(new LabiakLexicalVocabulary(), new LabiakSyntaticVocabulary())
  }

  check(g) {
    const ar = Array.from(this.lexemes.parse(g))
    console.log(ar)
    g = generator(ar)
    return this.syntax.check(g)
  }
}

const l = new Labiak()
