const Lexemes = {}

Lexemes.BackusNaur = new LexicalVocabulary()
Lexemes.BackusNaur.setRegex('Atom', /^\w+|^\d?\.\d+|^'([^']+)'|^"([^"]+)"/)
Lexemes.BackusNaur.setRegex('Space', /^\s+/m)
Lexemes.BackusNaur.setString('GroupLeft', '(')
Lexemes.BackusNaur.setString('GroupRight', ')')
Lexemes.BackusNaur.setString('Or', '|')
Lexemes.BackusNaur.setString('RepeatLeft', '{')
Lexemes.BackusNaur.setString('RepeatRight', '}')
Lexemes.BackusNaur.setString('OptLeft', '[')
Lexemes.BackusNaur.setString('OptRight', ']')
Lexemes.BackusNaur.setString('End', ';')
Lexemes.BackusNaur.setString('Assign', '=')

Lexemes.Labiak = new LexicalVocabulary()
Lexemes.Labiak.setRegex('Space', /^\s+/m)
Lexemes.Labiak.setRegex('Real', /^\d+.\d+/)
Lexemes.Labiak.setRegex('Integer', /^\d+/)
Lexemes.Labiak.setRegex('Atom', /^[a-z]\w*/i)
Lexemes.Labiak.setString('Assign', '=')
Lexemes.Labiak.setString('Add', '+')
Lexemes.Labiak.setString('Sub', '-')
Lexemes.Labiak.setString('Mult', '*')
Lexemes.Labiak.setString('Div', '*')
Lexemes.Labiak.setString('LeftRound', '(')
Lexemes.Labiak.setString('RightRound', ')')

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
