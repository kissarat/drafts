class BackusNaurLexicalVocabulary extends LexicalVocabulary {
  constructor(...args) {
    super(...args)
    this.setRegExp('Atom', /^\w+|^\d?\.\d+|^'([^']+)'|^"([^"]+)"/)
    this.setRegExp('Space', /^\s+/m)
    this.setString('GroupLeft', '(')
    this.setString('GroupRight', ')')
    this.setString('Or', '|')
    this.setString('RepeatLeft', '{')
    this.setString('RepeatRight', '}')
    this.setString('OptLeft', '[')
    this.setString('OptRight', ']')
    this.setString('End', ';')
    this.setString('Assign', '=')
  }
}

class BackusNaurSyntaticVocabulary extends SyntaticVocabulary {
  parseDefinition(g, ruleClass) {
    let node = new ruleClass()
    let alt = false

    loop: for (let nc = g.next(); !nc.done; nc = g.next()) {
      const c = nc.value
      switch (c.type) {
        case 'RepeatLeft':
          const repeat = this.parseDefinition(g, RepeatRule)
          node.push('or' === repeat.type ? new RepeatRule(repeat) : repeat)
          break

        case 'OptLeft':
          const opt = this.parseDefinition(g, OptRule)
          node.push('or' === opt.type ? new OptRule(opt) : opt)
          break

        case 'GroupLeft':
          node.push(this.parseDefinition(g, GroupRule))
          break

        case 'Or':
          if (!alt) {
            alt = new OrRule()
          }
          alt.push(node.isMultiple ? node : node.first)
          node = new GroupRule()
          break

        case 'Assign':
          node = new AssignRule(node.first, this.parseDefinition(g, GroupRule))
          break loop

        case 'Atom':
          node.push(new AtomRule(c.first))
          break

        default:
          throw new Error(c)
          break

        case 'RepeatRight':
        case 'OptRight':
        case 'GroupRight':
        case 'End':
          break loop
      }
    }
    if (alt) {
      if (node.isMultiple) {
        alt.push(node)
      }
      else {
        alt.push(node.first)
      }
      return alt
    }
    return node
  }

  *parse(g) {
    let definition
    while ((definition = this.parseDefinition(g, GroupRule)) && 'assign' === definition.type) {
      if ('assign' === definition.type) {
        yield definition
      }
      else {
        throw new Error('Unknown definition ' + JSON.stringify(definition))
      }
    }
  }
}

class BackusNaur extends Language {
  constructor() {
    super(new BackusNaurLexicalVocabulary(), new BackusNaurSyntaticVocabulary())
  }
}

const backus = new BackusNaur()
