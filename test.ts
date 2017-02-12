import lexer from './lexer'

const src = `
p = 'asd'
q = 'lol'

integer = 123

qp = '$asd $lol $integer'

`

console.log(lexer(src))
