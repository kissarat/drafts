function parseRule(rule, g) {
  let c
  switch (rule[0]) {
    case 'group':
  }
}

function parse(syntax, g) {
  let c
  rules: for (const key in syntax) {
    const rule = syntax[key]
    const result = [key]
    for (let i = 1; i < rule.length; i++) {
      const isLast = i === rule.length - 1
      if (c = g.at(i)) {
        switch (rule[0]) {
          case 'or':
            if (rule.indexOf(c) > 0) {
              result.push(c)
            }
            break

          case 'group':
            if (c === rule[i]) {
              result.push(c)
            }
            else {
              continue rules
            }
            break

          case 'opt':
            if (c === rule[i]) {
              result.push(c)
            }
            else if (0 === i){
              return true
            }
            break

          case 'repeat':
            if (c === rule[i]) {
              result.push(c)
            }
            else if (isLast) {
              i = 0
            }
            else {
              continue rules
            }
            break
        }
      }
      else {
        return false
      }
      return result
    }
  }
}
