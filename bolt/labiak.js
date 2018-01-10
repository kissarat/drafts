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

  check(language, g) {
    return this.root.check(language, g)
  }
}

LabiakSyntaticVocabulary.string = `
  Number = Integer | Real ;
  Addictive = Add | Sub ;
  Op = Addictive | Mult | Div ;
  Computable = Atom | Number ;
  Exp = LeftRound Exp RightRound | Computable Op Computable | Computable Op Exp ;
  Define = Atom Assign Exp ;
  St = Exp | Define;
`

class Labiak extends Language {
  constructor() {
    super(new LabiakLexicalVocabulary(), new LabiakSyntaticVocabulary())
  }

  check(g) {
    const ar = Array.from(this.lexemes.parse(g))
    g = generator(ar)
    g()
    g.gas = 300
    return this.syntax.check(this, g)
  }
}

const l = new Labiak()
