// // import * as R from 'ramda'
//
// type Token = ['SPACE', string]
//            | ['NEWLINE', string]
//            | ['ID', string]
//            | ['OP', string]
//            | ['STR', string]
//            | ['INT', string]
//
// type AstNodeType = 'AssignmentExpression'
//                  | 'Identifier'
//                  | 'StringLiteral'
//
// interface AstNode {
//   type: AstNodeType
// }
//
// interface Identifier extends AstNode {
//   name: string
// }
//
// interface StringLiteral extends AstNode {
//   value: string
// }
//
// interface AssignmentExpression extends AstNode {
//   left: AstNode
//   right: AstNode
// }
//
// interface ParserState {
//   remainingTokens: Token[],
//   ast?: AstNode,
//   error?: string
// }
//
// function headToken(state: ParserState) {
//   return state.remainingTokens.length >= 0 ? state.remainingTokens[0] : undefined;
// }
//
// function consumeToken(state: ParserState) {
//   const [, ...tail] = state.remainingTokens
//   return {
//     ...state,
//     remainingTokens: tail
//   }
// }
//
// function astSet(state: ParserState, node: AstNode) {
//   return {
//     ...state,
//     ast: node,
//   }
// }
//
// function error(state: ParserState, error: string) {
//   return {
//     ...state,
//     error,
//   }
// }
//
// type Parser = (state: ParserState) => ParserState
//
// function seq(p1: Parser, p2: Parser) {
//   return (state: ParserState) => {
//     const s1 = p1(state)
//     if (!s1.error) {
//       return p2(s1)
//     } else {
//       return s1
//     }
//   }
// }
//
// function end() {
//   return (state: ParserState) => {
//     return headToken(state) === undefined ? state : error(state, 'expected no more input')
//   }
// }
//
// function identifier() {
//   return (state: ParserState) => {
//     const token = headToken(state)
//     if (token && token[0] === 'ID') {
//       const node: Identifier = {type: 'Identifier', name: token[1]}
//       return astSet(consumeToken(state), node)
//     } else {
//       return error(state, 'expected Identifier');
//     }
//   }
// }
//
// function token(tokenType: string, tokenValue: string) {
//   return (state: ParserState) => {
//     const token = headToken(state)
//     if (token && token[0] === tokenType && token[1] === tokenValue) {
//       return consumeToken(state)
//     } else {
//       return error(state, 'expected ${tokenValue}');
//     }
//   }
// }
//
// function stringLiteral() {
//   return (state: ParserState) => {
//     const token = headToken(state)
//     if (token && token[0] === 'STR') {
//       const node: StringLiteral = {type: 'StringLiteral', value: token[1]}
//       return astSet(consumeToken(state), node)
//     } else {
//       return error(state, 'expected StringLiteral');
//     }
//   }
// }
//
// function assignment() {
//   return (state: ParserState) => {
//     const s1 = identifier()(state)
//     if (!s1.error) {
//       const s2 = token('OP', '=')(s1)
//       if (!s2.error) {
//         const s3 = stringLiteral()(s2)
//         if (!s3.error) {
//           const node: AssignmentExpression = {
//             type: 'AssignmentExpression',
//             left: s1.ast!,
//             right: s3.ast!,
//           }
//           return astSet(s3, node)
//         } else {
//           return s3
//         }
//       } else {
//         return s2
//       }
//     } else {
//       return s1
//     }
//   }
// }
//
// function asd<T, U>(a: T, b: U) {
//   return ([(a), (b)]);
// }
//
// asd(1, 'a')
//
// function fooParser(tokens: Token[]) {
//   const startState = {remainingTokens: tokens, ast: undefined, error: undefined}
//   return seq(assignment(), end())(startState)
// }
//
// const tokens: Token[] = [
// //  ['NEWLINE', '\n'],
//   ['ID', 'asd'],
//   ['OP', '='],
//   ['STR', 'lol'],
//   ['NEWLINE', '\n'],
//   // ['NEWLINE', '\n'],
// ]
//
// console.log(fooParser(tokens))





// // import * as R from 'ramda'
//
//
// interface ParseTree<T, L> {
//   item: T | L
//   children: ParseTree<T, L>[]
// }
//
// function tree<T, L>(item: T | L, children: ParseTree<T, L>[] = []): ParseTree<T, L> {
//   return {item, children};
// }
//
// interface ParserState<T, L> {
//   remainingTokens: T[]
//   tree?: ParseTree<T, L>
//   error?: string
// }
//
// type Parser<T, L> = (state: ParserState<T, L>) => ParserState<T, L>
//
// function headToken<T, L>(state: ParserState<T, L>) {
//   return state.remainingTokens.length >= 0 ? state.remainingTokens[0] : undefined;
// }
//
// function consumeToken<T, L>(state: ParserState<T, L>) {
//   const [, ...tail] = state.remainingTokens
//   return {
//     ...state,
//     remainingTokens: tail
//   }
// }
//
// function treeSet<T, L>(state: ParserState<T, L>, tree: ParseTree<T, L>) {
//   return {
//     ...state,
//     tree,
//   }
// }
//
// function error<T, L>(state: ParserState<T, L>, error: string) {
//   return {
//     ...state,
//     error,
//   }
// }
//
//
// function seq<T, L>(p1: Parser<T, L>, p2: Parser<T, L>) {
//   return (state: ParserState<T, L>) => {
//     const s1 = p1(state)
//     if (!s1.error) {
//       const s2 = p2(s1)
//       if (!s2.error) {
//         return treeSet(s2, tree(, [s1, s2]))
//       } else {
//         return s2
//       }
//     } else {
//       return s1
//     }
//   }
// }
//
// function end<T, L>() {
//   return (state: ParserState<T, L>) => {
//     return headToken(state) === undefined ? state : error(state, 'expected no more input')
//   }
// }
//
// type TokenMatcher<T> = (token: T) => boolean
//
// function token<T, L>(tokenMatcher: TokenMatcher<T>) {
//   return (state: ParserState<T, L>) => {
//     const token = headToken(state)
//     if (token && tokenMatcher(token)) {
//       return treeSet(consumeToken(state), tree(token))
//     } else {
//       return error(state, 'expected ${tokenValue}');
//     }
//   }
// }
//
//
// // ----
//
//
// type TokenType = 'SPACE'
//                | 'NEWLINE'
//                | 'ID'
//                | '='
//                | 'STR'
//                | 'INT'
//
// type Token = [TokenType, string]
//
// type Label = 'Expression'
//            | 'AssignmentExpression'
//
//
// // function identifier() {
// //   return (state: ParserState) => {
// //     const token = headToken(state)
// //     if (token && token[0] === 'ID') {
// //       const node: Identifier = {type: 'Identifier', name: token[1]}
// //       return astSet(consumeToken(state), node)
// //     } else {
// //       return error(state, 'expected Identifier');
// //     }
// //   }
// // }
//
// function tokenMatcher(tokenType: TokenType) {
//   return (token: Token) => token[1] == tokenType
// }
//
// function tokenOfType(tokenType: TokenType) {
//   return token(tokenMatcher(tokenType))
// }
//
// function identifier() {
//   return (state: ParserState<Token, Label>) => {
//     return tokenOfType('ID')(state)
//   }
// }
//
// function assignmentExpression() {
//   return (state: ParserState<Token, Label>) => {
//     return seq()
//   }
// }
//
// function expression() {
//   return (state: ParserState<Token, Label>) => {
//     return assignmentExpression()(state)
//   }
// }
//
// function fooParser(tokens: Token[]) {
//   const startState: ParserState<Token, Label> = {remainingTokens: tokens, tree: undefined, error: undefined}
//   return expression()(startState)
// }
//
// const tokens: Token[] = [
// //  ['NEWLINE', '\n'],
//   ['ID', 'asd'],
//   ['=', ''],
//   ['STR', 'lol'],
//   ['NEWLINE', '\n'],
//   // ['NEWLINE', '\n'],
// ]
//
// console.log(fooParser(tokens))
