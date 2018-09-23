class State {
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

export default State
