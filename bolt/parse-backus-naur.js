function range(max, min = 0) {
  const array = []
  for (let i = min; i < max; i++) {
    array.push(i)
  }
  return array
}

function genArray(size) {
  const array = []
  for (let i = 0; i < size; i++) {
    array.push(i)
  }
  return array
}

/**
 * @param it Iterator
 * @param type
 * @returns {*}
 */
function parseBackusNaurDefinition(it, type = null) {
  let node = []
  let isAlternative = false
  let c

  loop: while (it.shift()) {
    switch (it.current) {
      case 'RepeatLeft':
        node.push(parseBackusNaurDefinition(it, 'repeat'))
        break

      case 'OptLeft':
        node.push(parseBackusNaurDefinition(it, 'opt'))
        break

      case 'GroupLeft':
        node.push(parseBackusNaurDefinition(it, 'group'))
        break

      case 'Or':
        isAlternative = true
        break

      case 'Assign':
        type = 'Assign'
        node = [node[0], parseBackusNaurDefinition(it, 'group')]
        break loop

      default:
        // if ('string' === typeof c) {
        //   node.push(c)
        // }
        if ((it.current instanceof Array) && ('Atom' === it.current[0])) {
          node.push(it.current[1])
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
      case 'Comment':
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
  const it = new Iterator(symbols)
  const definitions = {}
  let definition
  while ((definition = parseBackusNaurDefinition(it)) && !it.done) {
    if (definition.length > 0) {
      if ('Assign' === definition[0]) {
        definitions[definition[1]] = definition[2]
      }
      else {
        throw new Error('Unknown definition ' + JSON.stringify(definition))
      }
    }
    else {
      // console.warn('Zero line')
    }
  }
  return definitions
}
