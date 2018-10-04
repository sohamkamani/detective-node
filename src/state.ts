import timer from './timer'

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
  timerDone: () => number
  dependencies: State[]
  constructor (name: string) {
    this.name = name
    this.active = false
    this.status = ''
    this.latency = 0
    this.dependencies = []
    this.timerDone = timer()
  }
  done () {
    this.latency = this.timerDone()
  }
  withError (err: Error): State {
    this.done()
    this.status = err.toString()
    this.active = false
    return this
  }
  withOk (): State {
    this.done()
    this.status = 'Ok'
    this.active = true
    return this
  }
  withDependencies (dependencies: State[]): State {
    this.dependencies = dependencies
    if (dependencies.some((d) => !d.active)) {
      return this.withError(new Error('dependency failure'))
    }
    return this.withOk()
  }
}

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
