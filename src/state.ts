import timer from './timer'

/**
 * @ignore
 */
export interface iState {
  name: string
  active: boolean
  status: string
  latency: number
  dependencies: State[]
}

class State implements iState {
  name: string
  active: boolean
  status: string
  latency: number
  private timerDone: () => number
  dependencies: State[]

  /**
   * @ignore
   */
  constructor (name: string) {
    this.name = name
    this.active = false
    this.status = ''
    this.latency = 0
    this.dependencies = []
    this.timerDone = timer()
  }

  private done () {
    this.latency = this.timerDone()
  }

  /**
   * @ignore
   */
  withError (err: Error): State {
    this.done()
    this.status = err.toString()
    this.active = false
    return this
  }

  /**
   * @ignore
   */
  withOk (): State {
    this.done()
    this.status = 'Ok'
    this.active = true
    return this
  }

  /**
   * @ignore
   */
  withDependencies (dependencies: State[]): State {
    this.dependencies = dependencies
    if (dependencies.some((d) => !d.active)) {
      return this.withError(new Error('dependency failure'))
    }
    return this.withOk()
  }
}

/**
 * @ignore
 */
export function stateFromObject (o: iState): State {
  const s = new State('')
  s.name = o.name
  s.active = o.active
  s.status = o.status
  s.latency = o.latency
  if (o.dependencies instanceof Array) {
    s.dependencies = o.dependencies.map(stateFromObject)
  }
  return s
}

export default State
