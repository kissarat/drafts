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
    this.definition = new BackusNaur()
    this.definition.parse(this.constructor.SYNTAX)
  }
}

LabiakSyntaticVocabulary.SYNTAX = `
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
}

const l = new Labiak()
