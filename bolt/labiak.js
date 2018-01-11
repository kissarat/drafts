class LabiakLexicalVocabulary extends LexicalVocabulary {
  constructor(...args) {
    super(...args)
    this.setRegExp('Space', /^\s+/m)
    this.setRegExp('Real', /^\d+\.\d+/)
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
    const result = this.root.check(language, g)
    if (result && g.index >= g.array.length) {
      return result
    }
  }
}

LabiakSyntaticVocabulary.string = `
  Number = Integer | Real ;
  Addictive = Add | Sub ;
  Op = Addictive | Mult | Div ;
  Computable = Atom | Number ;
  Exp = [Addictive] (LeftRound Exp RightRound | Computable) [Op Exp];
  St = [Atom Assign] Exp ;
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

function assertStatement(truth, s) {
  const result = l.check(s)
  if (truth ? !result : result) {
    throw new Error(s)
  }
}

function labiakTest() {
  assertStatement(true, '1')
  assertStatement(false, '1 1')
  assertStatement(true, 'a')
  assertStatement(false, '(a')
  assertStatement(false, 'a)')
  assertStatement(true, '(a + b)')
  assertStatement(true, '(1 + b)')
  assertStatement(false, '1 (1 + b)')
  assertStatement(false, '()')
  assertStatement(false, '(+)')
  assertStatement(true, 'a = 1')
  assertStatement(false, '(a) = 1')
  assertStatement(false, 'a = = 1')
  assertStatement(true, '(1 + b) * c')
  assertStatement(false, '(1 = b) * c')
  assertStatement(true, '-(1)')
}
