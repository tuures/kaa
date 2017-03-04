// ---

interface Success<R> {
  type: 'Success'
  result: R,
}

interface Failure {
  type: 'Failure',
  expected: string,
}

// ---

interface ParserState<T, R> {
  result: Success<R> | Failure,
  remaining: T[],
}

type Parser<T, R0, R1> = (state: ParserState<T, R0>) => ParserState<T, R1>

function successResult<R>(result: R): Success<R> {
  return {type: 'Success', result}
}

function failureResult(expected: string): Failure {
  return {type: 'Failure', expected}
}

function success<T, R>(result: R) {
  return (state: ParserState<T, any>): ParserState<T, R> => {
    return {
      remaining: state.remaining,
      result: successResult(result),
    }
  }
}

function failure<T, R>(expected: string) {
  return (state: ParserState<T, any>): ParserState<T, R> => {
    return {
      remaining: state.remaining,
      result: failureResult(expected),
    }
  }
}

function pipe<T, R0, R1, R2>(p1: Parser<T, R0, R1>, p2: Parser<T, R1, R2>) {
  return (s0: ParserState<T, R0>): ParserState<T, R2> => {
    return p2(p1(s0))
  }
}

function fold<T, R0, R>(onSuccess: (result: R0) => R, onFailure: (expected: string) => string) {
  return (state: ParserState<T, R0>): ParserState<T, R> => {
    if (state.result.type === 'Success') {
      const r = state.result.result
      return success<T, R>(onSuccess(r))(state)
    } else {
      const e = state.result.expected
      return failure<T, R>(onFailure(e))(state)
    }
  }
}

function failureAs<T, R>(state: ParserState<T, any>): ParserState<T, R> {
  if (state.result.type === 'Failure') {
    return state as ParserState<T, R>
  } else {
    throw Error('not Failure')
  }
}

function token<T>(expected: string, tokenMatcher: (token: T) => boolean) {
  return (state: ParserState<T, any>): ParserState<T, T> => {
    const [head, ...tail] = state.remaining
    const match = head !== undefined && tokenMatcher(head)
    return {
      remaining: match ? tail : state.remaining,
      result: match ? successResult(head) : failureResult(expected),
    }
  }
}

function seq<T, R0, R1, R2>(p1: Parser<T, R0, R1>, p2: Parser<T, R1, R2>) {
  return (s0: ParserState<T, R0>): ParserState<T, [R1, R2]> => {
    const s1 = p1(s0)
    if (s1.result.type === 'Success') {
      const r1 = s1.result.result
      const s2 = p2(s1)
      if (s2.result.type === 'Success') {
        const r2 = s2.result.result
        const r: [R1, R2] = [r1, r2]
        return {
          remaining: s2.remaining,
          result: successResult(r),
        }
      } else {
        return failureAs<T, [R1, R2]>(s2)
      }
    } else {
      return failureAs<T, [R1, R2]>(s1)
    }
  }
}

function endAfter<T, R1, R2>(parser: Parser<T, R1, R2>) {
  return (state: ParserState<T, R1>): ParserState<T, R2> => {
    const s = parser(state)
    if (s.result.type === 'Success' && s.remaining.length > 0) {
      return failure<T, R2>('end of input')(s)
    } else {
      return s
    }
  }
}

// ----
// ----
// ----

type TokenType = 'SPACE'
               | 'NEWLINE'
               | 'ID'
               | '='
               | 'STR'
               | 'INT'

type Token = [TokenType, string]

interface Identifier {
  type: 'Identifier',
  name: string,
}

interface StringLiteral {
  type: 'StringLiteral',
  value: string
}

interface Assignment {
  type: 'Assignment',
  lhs: Identifier,
  rhs: StringLiteral
}

function tokenOfType(tokenType: TokenType) {
  return token(tokenType, (token: Token) => token[0] === tokenType)
}

function singleTokenNode<N>(tokenType: TokenType, nodeType: string, toNode: (token: Token) => N) {
  return pipe(
    tokenOfType(tokenType),
    fold<Token, Token, N>(toNode, () => nodeType)
  )
}

const Identifier = () => singleTokenNode<Identifier>('ID', 'Identifier', (token: Token) => ({
  type: 'Identifier',
  name: token[1],
}));

// function identifier() {
//   return pipe(
//     tokenOfType('ID'),
//     fold<Token, Token, Identifier>((token: Token) => ({
//       type: 'Identifier',
//       name: token[1],
//     }), () => 'Identifier')
//   )
// }

// function identifier() {
//   return (state: ParserState<Token, any>): ParserState<Token, Identifier> => {
//     const s = tokenOfType('ID')(state)
//     if (s.result.type === 'Success') {
//       const token = s.result.result
//       const node: Identifier = {
//         type: 'Identifier',
//         name: token[1],
//       }
//       return success<Token, Identifier>(node)(s)
//     } else {
//       return failure<Token, Identifier>('Identifier')(s)
//     }
//   }
// }

function stringLiteral() {
  return pipe(
    tokenOfType('STR'),
    fold<Token, Token, StringLiteral>((token: Token) => ({
      type: 'StringLiteral',
      value: token[1],
    }), () => 'StringLiteral')
  )
}

// function stringLiteral() {
//   return (state: ParserState<Token, any>): ParserState<Token, StringLiteral> => {
//     const s = tokenOfType('STR')(state)
//     if (s.result.type === 'Success') {
//       const token = s.result.result
//       const node: StringLiteral = {
//         type: 'StringLiteral',
//         value: token[1],
//       }
//       return success<Token, StringLiteral>(node)(s)
//     } else {
//       return failure<Token, StringLiteral>('StringLiteral')(s)
//     }
//   }
// }

function assignment() {
  return pipe(
    seq<Token, any, Identifier, StringLiteral>(Identifier(), stringLiteral()),
    fold<Token, [Identifier, StringLiteral], Assignment>((r: [Identifier, StringLiteral]) => ({
      type: 'Assignment',
      lhs: r[0],
      rhs: r[1],
    }), () => 'Assignment')
  )
}

// function assignment() {
//   return (state: ParserState<Token, any>): ParserState<Token, Assignment> => {
//     const s = seq<Token, any, Identifier, StringLiteral>(identifier(), stringLiteral())(state)
//     if (s.result.type === 'Success') {
//       const r = s.result.result
//       const node: Assignment = {
//         type: 'Assignment',
//         lhs: r[0],
//         rhs: r[1],
//       }
//       return success<Token, Assignment>(node)(s)
//     } else {
//       return failure<Token, Assignment>('Assignment')(s)
//     }
//   }
// }

// function assignment() {
//   return (state: ParserState<Token, any>): ParserState<Token, Assignment> => {
//     // const s1 = seq<Token, any, Identifier, Token>(identifier(), tokenOfType('='))(state)
//     const s = seq<Token, any, [Identifier, Token], Token>(seq<Token, any, Identifier, Token>(identifier(), tokenOfType('=')), tokenOfType('STR'))(state)
//     if (s.result.type === 'Success') {
//
//     } else {
//       return failureAs<T, Assignment>(s)
//     }
//   }
// }

const parserImpl = endAfter(assignment())

function fooParser(tokens: Token[]): ParserState<Token, Assignment> {
  const startState: ParserState<Token, undefined> = {
    remaining: tokens,
    result: successResult(undefined),
  }
  return parserImpl(startState)
}

const tokens: Token[] = [
//  ['NEWLINE', '\n'],
  ['ID', 'asd'],
  //['=', ''],
  ['STR', 'lol'],
//  ['NEWLINE', '\n'],
  // ['NEWLINE', '\n'],
]

function main() {
  const s = fooParser(tokens)
  console.log("remaining: " + JSON.stringify(s.remaining, null, 2))
  if (s.result.type === 'Success') {
    console.log("ast: " + JSON.stringify(s.result.result, null, 2))
  } else {
    console.log("parse error: expected " + s.result.expected + " at TODO")
  }
}

main()
