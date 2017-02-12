import * as RegExpRuleLexer from './lib/RegExpRuleLexer'

type Token = ['SPACE', string]
           | ['NEWLINE', string]
           | ['ID', string]
           | ['OP', string]
           | ['STR', string]
           | ['INT', string]

const rules: RegExpRuleLexer.Rule<Token>[] = [
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

const impl = RegExpRuleLexer.create<Token>(rules, t => t[0] === 'NEWLINE')

export default function lexer(source: string) {
  return impl(source)
}
