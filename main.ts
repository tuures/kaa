import * as RegExpRuleLexer from './lib/RegExpRuleLexer'

export type Token = ['SPACE', string]
                  | ['NEWLINE', string]
                  | ['ID', string]
                  | ['OP', string]
                  | ['STR', string]
                  | ['INT', string]

const lexerRules: RegExpRuleLexer.Rule<Token>[] = [
  [
    /[\t ]+/,
    c => ['SPACE', c[0]]
  ],
  [
    /\r?\n/,
    c => ['NEWLINE', c[0]]
  ],
  [
    /=/,
    c => ['OP', c[0]]
  ],
  [
    /'([^']+)'/,
    c => ['STR', c[1]]
  ],
  [
    /\d+/,
    c => ['INT', c[0]]
  ],
  [
    /\w+/,
    c => ['ID', c[0]]
  ],
]

const lexer = RegExpRuleLexer.create<Token>(lexerRules, t => t[0] === 'NEWLINE')

function parser(tokens: Token[]) {
  return tokens
}

function compiler(source: string) {
  const {tokens, error, row, col} = lexer(source)
  if (error) {
    console.log(`Unexpected character at ${row}:${col}`)
  } else {
    console.log(parser(tokens))
  }
}


const src = `
p = 'asd'
q = 'lol'

integer = 123

qp = '$asd $lol $integer'

`

console.log(compiler(src))
