export default function stringReducer<A>(f: (str: string, acc: A) => [number, A]) {
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
