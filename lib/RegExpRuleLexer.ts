import * as R from 'ramda'

import stringReducer from './stringReducer'

export type Rule<T> = [RegExp, (captures: string[]) => T]

function extractPrefix(regexp: RegExp, str: string): string[] | undefined {
  const m = str.match(new RegExp(`^${regexp.source}`))
  return m === null ? undefined : [...m]
}

interface RuleMatchResult<T> {
  matchLength: number
  token?: T
}

function applyRule<T>(str: string) {
  return (rule: Rule<T>): RuleMatchResult<T> | undefined => {
    const [regExp, createToken] = rule
    const captures = extractPrefix(regExp, str)
    return !captures ? undefined : {
      matchLength: captures[0].length,
      token: createToken ? createToken(captures) : undefined
    }
  }
}

function extractToken<T>(rules: Rule<T>[], str: string): RuleMatchResult<T> {
  const applyRuleToStr = applyRule<T>(str)
  const tokenResult: RuleMatchResult<T> | undefined = R.pipe(
    R.map(applyRuleToStr),
    R.reject(R.isNil),
    R.take<RuleMatchResult<T>>(1)
  )(rules)[0]

  return tokenResult || {
    matchLength: 0,
    token: undefined
  }
}

interface LexerState<T> {
  tokens: T[]
  row: number,
  col: number,
  error: boolean
}

function createLexer<T>(rules: Rule<T>[], isNewline: (token: T) => boolean) {
  return stringReducer((remainingStr: string, acc: LexerState<T>) => {
    const {matchLength, token} = extractToken<T>(rules, remainingStr)

    const newline = token && isNewline(token);

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
}

export function create<T>(rules: Rule<T>[], isNewline: (token: T) => boolean) {
  const lexer = createLexer<T>(rules, isNewline)
  return (source: string) => {
    const startState = {tokens: [], col: 1, row: 1, error: false}
    return lexer(source, startState)
  }
}
