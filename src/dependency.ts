import State from './state'

type detectorFn = (cb: (err?: Error) => void) => void
export type callbackWithState = (s: State) => void

/**
 * @ignore
 */
const noop: detectorFn = (cb) => {
  cb()
}

/**
 * Dependency represents an external dependency registered with a detective instance
 */
class Dependency {
  private name: string
  private detector: detectorFn
  constructor (name: string) {
    this.name = name
    this.detector = noop
  }

  detect (fn: detectorFn) {
    this.detector = fn
  }

  /**
   * 
   * @ignore
   */
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
