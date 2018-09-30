import State from './state'
import { callbackWithState } from './dependency'

type callbackWithStates = (s: State[]) => void

export const toPromise = (fn: (cb: callbackWithState) => void): Promise<State> => {
  const p: Promise<State> = new Promise((resolve) => {
    fn((s: State) => {
      resolve(s)
    })
  })
  return p
}

export const executeAll = (fns: ((cb: callbackWithState) => void)[], cb: callbackWithStates) => {
  const states: State[] = []
  let done = 0
  fns.forEach((fn, i) => {
    fn((s) => {
      states[i] = s
      done += 1
      if (done === fns.length) {
        cb(states)
      }
    })
  })
}
