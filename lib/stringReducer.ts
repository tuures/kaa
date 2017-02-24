import seqReducer from './seqReducer'

function length(str: string) {
  return str.length;
}

function drop(n: number, str: string) {
  return str.substr(n)
}

const stringReducer = seqReducer<string>(length, drop)

export default stringReducer
