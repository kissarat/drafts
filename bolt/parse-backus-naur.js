

function parseBackusNaurDefinition(g, ruleClass) {
  let node = new ruleClass()
  let alt = false
  let c

  loop: while (c = g()) {
    switch (c) {
      case 'RepeatLeft':
        const repeat = parseBackusNaurDefinition(g, RepeatRule)
        node.push('or' === repeat.type ? new RepeatRule(repeat) : repeat)
        break

      case 'OptLeft':
        const opt = parseBackusNaurDefinition(g, OptRule)
        node.push('or' === opt.type ? new OptRule(opt) : opt)
        break

      case 'GroupLeft':
        node.push(parseBackusNaurDefinition(g, GroupRule))
        break

      case 'Or':
        if ('or' !== node.type) {
          alt = new OrRule(node.isMultiple ? node : node.first)
        }
        node = new GroupRule()
        break

      case 'Assign':
        node = new AssignRule(node.first, parseBackusNaurDefinition(g, GroupRule))
        break loop

      default:
        // if ('string' === typeof c) {
        //   node.push(c)
        // }

        if (c && 'Atom' === c[0]) {
          node.push(new AtomRule(c[1]))
        }
        else {
          throw new Error(c)
          // console.error(c)
        }
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

function parseBackusNaur(symbols) {
  const g = generator(symbols)
  const definitions = []
  let definition
  while ((definition = parseBackusNaurDefinition(g, GroupRule)) && 'assign' === definition.type) {
    // console.log(definition)
    if ('assign' === definition.type) {
      definitions.push(definition)
    }
    else {
      throw new Error('Unknown definition ' + JSON.stringify(definition))
    }
  }
  return definitions
}
