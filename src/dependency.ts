import State from './state'

type detectorFn = (cb: (err?: Error) => void) => void
type callbackWithState = (s: State) => void

const noop: detectorFn = (cb) => {
  cb()
}

class Dependency {
  name: string
  detector: detectorFn
  state: State
  constructor (name: string) {
    this.name = name
    this.detector = noop
    this.state = new State(name)
  }

  detect (fn: detectorFn) {
    this.detector = fn
  }

  getState (cb: callbackWithState) {
    this.detector((err) => {
      const state = new State(this.name)
      if (err) {
        state.withError(err)
        this.state = state
        cb(state)
        return
      }
      state.withOk()
      this.state = state
      cb(state)
      return
    })
  }
}
