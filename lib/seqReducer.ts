type LengthFunction<S> = (seq: S) => number
type DropFunction<S> = (n: number, seq: S) => S

export default function seqReducer<S>(length: LengthFunction<S>, drop: DropFunction<S>) {
  return function <A>(f: (seq: S, acc: A) => [number, A]) {
    return function step(seq: S, acc: A): A {
      if (length(seq) <= 0) {
        return acc
      } else {
        const [count, updatedAcc] = f(seq, acc)
        if (count <= 0) {
          return updatedAcc
        } else {
          return step(drop(count, seq), updatedAcc)
        }
      }
    }
  }
}
