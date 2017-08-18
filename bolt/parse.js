function* generator(array) {
  for(let i = 0; i < array.length; i++) {
    yield array[i]
  }
}

function parseBackusNaurDefinition(g, type = null) {
  let node = []
  let isAlternative = false
  let c

  loop: while (c = g.next().value) {
    switch (c) {
      case 'RepeatLeft':
        node.push(parseBackusNaurDefinition(g, 'repeat'))
        break

      case 'OptLeft':
        node.push(parseBackusNaurDefinition(g, 'opt'))
        break

      case 'GroupLeft':
        node.push(parseBackusNaurDefinition(g, 'group'))
        break

      case 'Or':
        isAlternative = true
        break

      case 'Assign':
        type = 'Assign'
        node = [node[0], parseBackusNaurDefinition(g, 'group')]
        break loop

      default:
        // if ('string' === typeof c) {
        //   node.push(c)
        // }
        if (c && 'Atom' === c[0]) {
          node.push(c[1])
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
  if (type) {
    node.unshift(isAlternative ? 'or' : type)
    if (isAlternative && 'group' !== type) {
      return [type, node]
    }
  }
  return node
}

function parseBackusNaur(symbols) {
  const g = generator(symbols)
  const definitions = []
  let definition
  while ((definition = parseBackusNaurDefinition(g)) && definition.length > 0){
    definitions.push(definition)
  }
  return definitions
}
