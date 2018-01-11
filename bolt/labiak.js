class LabiakLexicalVocabulary extends LexicalVocabulary {
  constructor(...args) {
    super(...args)
    this.setRegExp('Space', /^\s+/m)
    this.setRegExp('Integer', /^\d+/)
    this.setRegExp('Real', /^\d+\.\d+/)
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

class Node extends Array {
  get name() {
    return this[0]
  }

  get first() {
    return this[1]
  }

  get second() {
    return this[2]
  }
}

Node.isNode = true

class Assignment extends Node {
  constructor(...array) {
    super(array[0].toString(), ...array.slice(2))
  }

  eval(context) {
    return context[this.name] = this.first.eval(context)
  }
}

class Exp extends Node {
  constructor(...array) {
    if ('string' !== array[0] && array[1][0] instanceof StringLexeme) {
      array = [array[1][0].type, array[0], ...array[1].slice(1)]
    }
    super(...array)
  }

  eval(context) {
    const first = 'function' === typeof this.first.eval ? this.first.eval(context) : this.first
    const second = 'function' === typeof this.second.eval ? this.second.eval(context) : this.second
    if (first.eval) {
      if (second.eval) {
        return this
      }
      return new Exp(this.name, first, second)
    }
    switch (this.name) {
      case 'Add':
        return first + second
      case 'Sub':
        return first - second
      case 'Mult':
        return first * second
      case 'Div':
        return first / second
      default:
        throw Error('Invalid operation ' + this.name)
    }
  }
}

class LabiakSyntaticVocabulary extends SyntaticVocabulary {
  constructor(...args) {
    super(...args)
    this.define()
    this.rules = {
      Assignment,
      Exp,

      Group(array) {
        return array[1]
      },
    }
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

// Exp = [Addictive] (LeftRound Exp RightRound | Computable) [Op Exp];
// Exp = Group [Op Group] [Op Cp] | Cp [Op Exp];
// Exp = (Cp | Group) [Op Group] [Op Cp];

LabiakSyntaticVocabulary.string = `
  Number = Integer | Real ;
  Ad = Add | Sub ;
  Mu = Mult | Div ;
  Op = Ad | Mu ;
  Cp = Atom | Number ;
  Group = LeftRound Exp RightRound ;
  Exp = (Cp | Group) [ Op Exp ];
  Assignment = Atom Assign Exp ;
  St = Assignment | Exp ; ;
`

class Labiak extends Language {
  constructor() {
    super(new LabiakLexicalVocabulary(), new LabiakSyntaticVocabulary())
  }

  check(g) {
    const ar = Array.from(this.lexemes.parse(g))
    g = generator(ar)
    g()
    g.gas = 1300
    const result = this.syntax.check(this, g)
    console.log('GAS: ' + (1300 - g.gas))
    return result
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
  assertStatement(true, 'd * (c + 1)')
  assertStatement(true, '(a + b) * (c + 1)')
  assertStatement(false, '(1 = b) * c')
  assertStatement(true, '-(1)')
}
