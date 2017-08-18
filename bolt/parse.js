function parseRule(rule, g) {
  let c
  switch (rule[0]) {
    case 'group':
  }
}

function parse(syntax, rule, g) {
  let a
  let c
  let r
  const result = []
  rama: for (let i = 1; i < rule.length; i++) {
    const element = rule[i]
    const isLast = i === rule.length - 1
    if (a = g.at(i)) {
      if (a instanceof Array) {
        for (const name in syntax) {
          const sub = syntax[name]
          if (sub instanceof Array) {
            r = parse(syntax, sub, g.slice(i - 1))
            if (true === r) {
              continue rama
            }
            else if (r instanceof Array) {
              a = r
              break
            }
          }
        }
      }
      c = a instanceof Array ? a[0] : a
      switch (rule[0]) {
        case 'or':
          if (rule.indexOf(c) > 0) {
            result.push(a)
          }
          break

        case 'group':
          if (c === element) {
            result.push(a)
          }
          else {
            return false
          }
          break

        case 'opt':
          if (c === element) {
            result.push(a)
          }
          else if (0 === i) {
            return true
          }
          break

        case 'repeat':
          if (c === element) {
            result.push(a)
          }
          else if (isLast) {
            i = 0
          }
          else {
            return false
          }
          break
      }
    }
    else {
      return false
    }
  }
  return result
}
