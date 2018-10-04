import State from './state'
import { callbackWithState } from './dependency'

type callbackWithStates = (s: State[]) => void

export const executeAll = (fns: ((_: callbackWithState) => void)[], cb: callbackWithStates) => {
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
