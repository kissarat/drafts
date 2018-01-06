function range(max, min = 0) {
  const array = []
  for (let i = min; i < max; i++) {
    array.push(i)
  }
  return array
}

function generator(array, start = -1) {
  function counter(control = 1) {
    if (isFinite(control)) {
      counter.index += control
    }
    return array[counter.index]
  }

  counter.index = start
  counter.array = array
  counter.can = function (i = 0) {
    return counter.index + i < counter.array.length
  }
  counter.slice = function (start = counter.index) {
    if (start < 0) {
      start += counter.index
    }
    return generator(counter.array, start)
  }
  counter.at = function (i = 0) {
    return counter.array[counter.index + i]
  }
  return counter
}

function parseBackusNaurDefinition(g, type = null) {
  let node = []
  let alt = false
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
        if ('or' !== type) {
          type = 'or'
          alt = [type]
        }
        if (node.length > 1)  {
          alt.push(node)
        }
        else {
          alt.push(node[0])
        }
        node = []
        break

      case 'Assign':
        type = 'assign'
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
  if (alt) {
    if (node.length > 1)  {
      alt.push(node)
    }
    else {
      alt.push(node[0])
    }
    return alt
  }
  if (type) {
    node.unshift(type)
  }
  return node
}

function parseBackusNaur(symbols) {
  const g = generator(symbols)
  const definitions = []
  let definition
  while ((definition = parseBackusNaurDefinition(g)) && definition.length > 0) {
    // console.log(definition)
    if ('assign' === definition[0]) {
      definitions.push(definition)
    }
    else {
      throw new Error('Unknown definition ' + JSON.stringify(definition))
    }
  }
  return definitions
}
