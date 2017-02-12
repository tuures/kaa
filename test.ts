import lexer from './lexer'

const src = `
p = 'asd'
q = 'lol'

qp = '$asd $lol'

`

console.log(lexer(src))
