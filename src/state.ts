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
  dependencies: State[]
  constructor (name: string) {
    this.name = name
    this.active = false
    this.status = ''
    this.latency = 0
    this.dependencies = []
  }
  withError (err: Error): State {
    this.status = err.toString()
    this.active = false
    return this
  }
  withOk (): State {
    this.status = 'Ok'
    this.active = true
    return this
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
