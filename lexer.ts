import * as R from 'ramda';

function stringReducer<A>(f: (str: string, acc: A) => [number, A]) {
  return function step(str: string, acc: A): A {
    if (str.length <= 0) {
      return acc
    } else {
      const [count, updatedAcc] = f(str, acc)
      if (count <= 0) {
        return updatedAcc
      } else {
        return step(str.substr(count), updatedAcc)
      }
    }
  }
}

function extractPrefix(regexp: RegExp, str: string): string[] | undefined {
  const m = str.match(new RegExp(`^${regexp.source}`))
  return m === null ? undefined : [...m]
}

type Token = ['SPACE', string] | ['NEWLINE', string] | ['ID', string] | ['OP', string] | ['LITSTR', string]

type Rule = [RegExp, (captures: string[]) => Token]

const rules: Rule[] = [
  [
    /[\t ]+/,
    c => ['SPACE', c[0]]
  ],
  [
    /\r?\n/,
    c => ['NEWLINE', c[0]]
  ],
  [
    /\w+/,
    c => ['ID', c[0]]
  ],
  [
    /=/,
    c => ['OP', c[0]]
  ],
  [
    /'([^']+)'/,
    c => ['LITSTR', c[1]]
  ]
]

interface RuleMatchResult {
  matchLength: number
  token?: Token
}

function applyRule(str: string) {
  return (rule: Rule): RuleMatchResult | undefined => {
    const [regExp, createToken] = rule
    const captures = extractPrefix(regExp, str)
    return !captures ? undefined : {
      matchLength: captures[0].length,
      token: createToken ? createToken(captures) : undefined
    }
  }
}

function extractToken(rules: Rule[], str: string): RuleMatchResult {
  const applyRuleToStr = applyRule(str)
  const tokenResult: RuleMatchResult | undefined = R.pipe(
    R.map(applyRuleToStr),
    R.reject(R.isNil),
    R.take<RuleMatchResult>(1)
  )(rules)[0]

  return tokenResult || {
    matchLength: 0,
    token: undefined
  }
}

interface LexerState {
  tokens: Token[]
  row: number,
  col: number,
  error: boolean
}

const stringReducerLexer = stringReducer((remainingStr: string, acc: LexerState) => {
  const {matchLength, token} = extractToken(rules, remainingStr)

  const newline = token && token[0] == 'NEWLINE';

  const updatedAcc = {
    ...acc,
    ...(matchLength > 0 ?
      token ? {
        tokens: [...acc.tokens, token],
        row: acc.row + (newline ? 1 : 0),
        col: newline ? 1 : acc.col + matchLength
      } : {}
    :
      {error: true}
    )
  }

  return [matchLength, updatedAcc]
})

export default function lexer(source: string) {
  const startState = {tokens: [], col: 1, row: 1, error: false}
  return stringReducerLexer(source, startState)
}
