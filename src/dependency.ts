import State from './state'
import timer from './timer'

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
    const timerDone = timer()
    this.detector((err) => {
      const latency = timerDone()
      const state = new State(this.name)
      state.latency = latency
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

export default Dependency
