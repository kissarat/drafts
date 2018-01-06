const BackusNaurLexemes = {
  Atom: /^\w+|^\d?\.\d+|^'([^']+)'|^"([^"]+)"/,
  // Comment: /^#.*/,
  Space: /^\s+/m,
  GroupLeft: '(',
  GroupRight: ')',
  Or: '|',
  RepeatLeft: '{',
  RepeatRight: '}',
  OptLeft: '[',
  OptRight: ']',
  End: ';',
  Assign: '='
}

const LanguageLexems = {
  Space: /^\s+/m,
  Integer: /^\d+/,
  Real: /^\d+\.\d+/,
  Atom: /^[a-z]\w*/i,
  Assign: '=',
  Add: '+',
  Sub: '-',
  Mult: '*',
  Div: '/'

}

function scan(string, lexemes = BackusNaurLexemes) {
  string = string
      .replace(/\s+/g, ' ')
  let s;
  let i = 0;
  const symbols = []
  next: for (; string.length > 0; i++) {
    for (const key in lexemes) {
      const lexeme = lexemes[key];
      if ('function' === typeof lexeme.exec && (s = lexeme.exec(string))) {
       string = string.replace(lexeme, '')
        s = s.length > 1 ? s[1] || s[2] || s[3] || s[4] || s[5] || s[0] : s[0]
        if ('Space' !== key) {
          symbols.push([key, s])
        }
        continue next
      }
      else if (string.indexOf(lexeme) === 0) {
       string = string.replace(lexeme, '')
        symbols.push(key)
        continue next
      }
      else if (lexeme instanceof Array) {
        continue
      }
      if (i > 1000 * 1000) {
        throw new Error('Too much lexemes')
      }
    }
    throw new Error(`Unknown lexeme at ${i}: ` + string.slice(i, i + 10))
  }
  return symbols
}
