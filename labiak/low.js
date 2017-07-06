const Atom = {
//    Literal: /^[\w_]+/,
  Alpha: /^[a-z_]+/i,
  Digit: /^[0-9]/,
  Float: /\d?\.\d+/,
  SingleQuote: /^'([^']+)'/,
  DoubleQuote: /^"([^"]+)"/,
//    Arithmetic: /^\+-\/\*$/
}

const Lexemes = {
  Atom: Object.keys(Atom).map(a => Atom[a]),
  Space: ' ',
  GroupLeft: '(',
  GroupRight: ')',
  Or: '|',
  RepeatLeft: '{',
  RepeatRight: '}',
  OptLeft: '[',
  OptRight: ']',
  End: ';',
  Assign: '=',
}


function scan(string, lexemes = Lexemes) {
  let sub = string
    .replace(/^\s+\/\/.*$/mg, '')
    .replace(/\s+/g, ' ')
    .trim()
  const array = []

  for (let i = 0; i < string.length;) {
    let s

    function lexemeScan(rule) {
      if (rule.exec && (s = rule.exec(sub))) {
        s = s.length > 1 ? s[1] : s[0]
        if (s) {
          sub = sub.replace(rule, '')
        }
      }
      else if (sub.indexOf(rule) === 0) {
        s = rule
        sub = sub.slice(s.length).trim()
      }
      if (s) {
        return true
      }
    }

    for (const key in lexemes) {
      const rules = lexemes[key]
      if (rules instanceof Array) {
        for (const rule of rules) {
          if (lexemeScan(rule)) {
            break
          }
        }
      }
      else {
        lexemeScan(rules)
      }
      if (s) {
        if ('Space' !== key) {
          array.push('Atom' === key ? s : key)
        }
        break
      }
    }

    if (0 === sub.length) {
//        console.log(array)
      return array
    }
    else if (!s) {
      console.log(sub, array)
      throw new Error(`Lexeme for "${sub.slice(50)}" not found`)
    }
  }
}

function parse(next, type) {
  let node = []
  let isAlternative = false
  let c

  loop: while (c = next()) {
    switch (c) {
      case 'RepeatLeft':
        node.push(parse(next, 'repeat'))
        break

      case 'OptLeft':
        node.push(parse(next, 'opt'))
        break

      case 'GroupLeft':
        node.push(parse(next, 'group'))
        break

      case 'Or':
        isAlternative = true
        break

      case 'Assign':
        type = 'Assign'
        node = [node[0], parse(next, 'group')]
        break loop

      default:
        if ('string' === typeof c) {
          node.push(c)
        }
        else {
          console.error(c)
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

function generator(array) {
  function counter(control) {
    if (isFinite(control)) {
      counter.number += control
    }
    else if (false !== control) {
      counter.number++
    }
    return array[counter.number]
  }
  counter.number = 0
  counter.array = array
  Object.defineProperty(counter, 'current', {
    get() {
      return array[counter.number]
    }
  })
  return counter
}
