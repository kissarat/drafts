const Lexemes = {}

Lexemes.BackusNaur = new Map()
Lexemes.BackusNaur.set('Atom', /^\w+|^\d?\.\d+|^'([^']+)'|^"([^"]+)"/)
Lexemes.BackusNaur.set('Space', /^\s+/m)
Lexemes.BackusNaur.set('GroupLeft', '(')
Lexemes.BackusNaur.set('GroupRight', ')')
Lexemes.BackusNaur.set('Or', '|')
Lexemes.BackusNaur.set('RepeatLeft', '{')
Lexemes.BackusNaur.set('RepeatRight', '}')
Lexemes.BackusNaur.set('OptLeft', '[')
Lexemes.BackusNaur.set('OptRight', ']')
Lexemes.BackusNaur.set('End', ';')
Lexemes.BackusNaur.set('Assign', '=')

Lexemes.Labiak = new Map()
Lexemes.Labiak.set('Space', /^\s+/m)
Lexemes.Labiak.set('Real', /^\d+.\d+/)
Lexemes.Labiak.set('Integer', /^\d+/)
Lexemes.Labiak.set('Atom', /^[a-z]\w*/i)
Lexemes.Labiak.set('Assign', '=')
Lexemes.Labiak.set('Add', '+')
Lexemes.Labiak.set('Sub', '-')
Lexemes.Labiak.set('Mult', '*')
Lexemes.Labiak.set('Div', '*')

function scan(string, lexemes = Lexemes.BackusNaur) {
  string = string
      .replace(/\s+/g, ' ')
  let s;
  let i = 0;
  const symbols = []
  next: for (; string.length > 0; i++) {
    for (const [key, lexeme] of lexemes) {
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
