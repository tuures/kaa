import _ = require('lodash/fp');

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

function extractPrefix(regexp: RegExp, str: string): string | undefined {
  return _.get('[0]', str.match(new RegExp(`^${regexp.source}`)))
}

type Token = [string, any]

interface Rule {
  regExp: RegExp
  token: (str: string) => Token
}

const rules = _.map(_.zipObject(['regExp', 'token']))([
  [
    /[\t ]+/
  ],
  [
    /\n/,
    (s: string) => ['newline']
  ],
  [
    /\w+/,
    (s: string) => ['identifier', s]
  ],
  [
    /=/,
    () => ['assignment']
  ],
  [
    /'[^']+'/,
    (s: string) => ['string literal', s]
  ]
])

function extractToken(rules: Rule[], str: string): {matchLength: number, token: Token | undefined} {
  const tokenResult = _.flow(
    _.map((rule: Rule) => {
      const s = extractPrefix(rule.regExp, str)
      return !s ? undefined : {
        matchLength: s.length,
        token: rule.token ? rule.token(s) : undefined
      }
    }),
    _.reject(_.isUndefined),
    _.take(1)
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

const lexer = stringReducer((remainingStr: string, acc: LexerState) => {
  const {matchLength, token} = extractToken(rules, remainingStr)

  const newline = token && token[0] == 'newline';

  const updatedAcc = {
    ...acc,
    ...(matchLength > 0 ?
      token ? {
        tokens: [...acc.tokens, token],
        row: acc.row + (newline ? 1 : 0),
        col: newline ? 1 : acc.col + 1
      } : {}
    :
      {error: true}
    )
  }

  return [matchLength, updatedAcc]
})


const src = `
p = 'asd'
q = 'lol'

qp = '$asd $lol'

`

console.log(lexer(src, {tokens: [], col: 1, row: 1, error: false}));
