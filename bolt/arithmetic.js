const arithmetic = {
  Lexemes: {
    Atom: /^\w+|^\d?\.\d+|^'([^']+)'|^"([^"]+)"/,
    Space: /^\s+/m,
    Left: '(',
    Right: ')',
    Assign: '=',
    Operation: /^[+\-*/]/
  },

  parse(it, node = []) {
    loop: while (it.shift()) {
      switch (it.current) {
        case 'Left':
          node.push(this.parse(it))
          break

        case 'Right':
        case 'Comment':
          break

        case 'Assign':
          this.parse(it, node)
          node.unshift('=')
          break

        default:
          if (it.current instanceof Array) {
            const v = it.current[1]
            if ('Operation' === it.current[0]) {
              node = [v, node[0], this.parse(it)]
            }
            else {
              node.push(v)
            }
          }

      }
    }
    return node;
  },

  build(string) {
    return this.parse(new Iterator(scan(string, this.Lexemes)))
  }
}
