function range(max, min = 0) {
  const array = []
  for (let i = min; i < max; i++) {
    array.push(i)
  }
  return array
}

function generator(array, start = 0) {
  function counter(control = 1) {
    const value = array[counter.number]
    if (isFinite(control)) {
      counter.number += control
    }
    return value
  }

  counter.number = start
  counter.array = array
  return counter
}

function parseBackusNaurDefinition(g, type = null) {
  let node = []
  let isAlternative = false
  let c

  loop: while (c = g()) {
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
  const definitions = {}
  let definition
  while ((definition = parseBackusNaurDefinition(g)) && definition.length > 0) {
    if ('Assign' === definition[0]) {
      definitions[definition[1]] = definition[2]
    }
    else {
      throw new Error('Unknown definition ' + JSON.stringify(definition))
    }
  }
  return definitions
}

function parseRule(rule, g) {

}

function parse(syntax, g) {
  let c
  while (c = g.next().value) {
    for (const key in syntax) {
      const rule = syntax[key]
      switch (rule[0]) {
        case 'group':

      }
    }
  }
}
