class LabiakLexicalVocabulary extends LexicalVocabulary {
  constructor(...args) {
    super(...args)
    this.setString('If', 'if')
    this.setString('Then', 'then')
    this.setString('Else', 'else')
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
    this.setString('LeftCurly', '{')
    this.setString('RightCurly', '}')
    this.setString('Terminator', ';')
    this.setString('Less', '<')
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

  get third() {
    return this[3]
  }

  get last() {
    return this[this.length - 1]
  }
}

Node.isNode = true

class Assignment extends Node {
  constructor(...array) {
    if ('Terminator' === array[array.length - 1].type) {
      array.pop()
    }
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
    if ('function' === typeof first.eval) {
      if ('function' === typeof second.eval) {
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
      case 'Less':
        return first < second
      default:
        throw Error('Invalid operation ' + this.name)
    }
  }
}

class Fork extends Node {
  constructor(...array) {
    if ('If' === array[0].type) {
      if (4 === array.length) {
        super('If', array[1], array[3])
      }
      else {
        super('If', array[1], array[3], array[4][1])
      }
    }
    else {
      super('If', ...array)
    }
  }

  eval(context) {
    const first = this.first.eval(context)
    const second = 'function' === typeof this.second.eval ? this.second.eval(context) : this.second
    if ('function' === typeof first.eval) {
      return this.third
          ? new Fork(first, this.second.eval(context))
          : new Fork(first, this.second.eval(context), this.third.eval(context))
    }
    return first ? second : 'function' === typeof this.third.eval ? this.third.eval(context) : this.third
  }
}

class Block extends Node {
  constructor(...array) {
    array = array.slice(1, -1)
    super('Block', ...array)
  }

  eval(context = {}) {
    let local = Object.create(context)
    for (let i = 1; i < this.length; i++) {
      this[i].eval(local)
    }
    return local
  }
}

class Apply extends Node {
  constructor(...array) {
    const p = []
    for(const a of array) {
      if (a.constructor === Array) {
        p.push(...a)
      }
      else {
        p.push(a)
      }
    }
    super('Apply', ...p)
  }

  eval(context) {
    for(let i = 1; i < this.length; i++) {
      context = this[i].eval(context)
      if ('function' === typeof context.eval) {
        return context
      }
    }
    return context
  }
}

class List extends Node {
  constructor(...array) {
    super('List', ...array)
  }

  eval(context) {

  }
}

class LabiakSyntaticVocabulary extends SyntaticVocabulary {
  constructor(...args) {
    super(...args)
    this.define()
    this.rules = {
      Assignment,
      Exp,
      Fork,
      Block,
      List,

      Group(array) {
        return array[1]
      },
    }
  }

  get root() {
    return this.get('List')
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
  Op = Add | Sub | Mult | Div | Less ;
  Cp = Atom | Number ;
  Block = LeftCurly Array RightCurly ;
  Apply = {Atom} Block | Atom Atom {Atom};
  Group = LeftRound Exp RightRound ;
  Fork = If Exp Then Exp [Else Exp] ;
  Exp = Block | Apply | Fork | (Cp | Group) [Op Exp];
  Assignment = Atom Assign Exp [Terminator] ;
  St = Assignment | Exp ;
  Array = {St} ;
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

  eval(string, context = {}) {
    const tree = this.check(string)
    if (tree instanceof Array) {
      for(const st of tree) {
        if ('function' === typeof st) {
          st.eval(context)
        }
        else {
          console.error(st)
        }
      }
      return context
    }
    else {
      return tree.eval(context)
    }
  }
}

const l = new Labiak()
l.debug = false

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
