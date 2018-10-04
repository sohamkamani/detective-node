import State from './state'
import timer from './timer'

type detectorFn = (cb: (err?: Error) => void) => void
export type callbackWithState = (s: State) => void

const noop: detectorFn = (cb) => {
  cb()
}

class Dependency {
  name: string
  detector: detectorFn
  constructor (name: string) {
    this.name = name
    this.detector = noop
  }

  detect (fn: detectorFn) {
    this.detector = fn
  }

  getState (cb: callbackWithState) {
    const state = new State(this.name)
    this.detector((err) => {
      if (err) {
        state.withError(err)
        cb(state)
        return
      }

      state.withOk()
      cb(state)
      return
    })
  }
}

export default Dependency
