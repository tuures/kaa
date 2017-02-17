import * as R from 'ramda'

type Token = ['SPACE', string]
           | ['NEWLINE', string]
           | ['ID', string]
           | ['OP', string]
           | ['STR', string]
           | ['INT', string]

const tokens: Token[] = [
  ['NEWLINE', '\n'],
  ['ID', 'asd'],
  ['OP', '='],
  ['STR', 'lol'],
  ['NEWLINE', '\n'],
  ['NEWLINE', '\n'],
]

/*

Assignment
left: Identifier
right: StringLiteral


*/

type AstNodeType = 'Assignment'
                 | 'Identifier'
                 | 'StringLiteral'

interface AstNode {
  type: AstNodeType
}

interface ParserState {
  remainingTokens: Token[],
  ast: AstNode,
}

const rules = {
  'Assignment': () => seq(tk('ID'), tk('OP', '='), tk('STR'))
};

function parse(state: ParserState) {

}
