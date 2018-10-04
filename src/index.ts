import Dependency, { callbackWithState } from './dependency'
import Endpoint, { fromHeader } from './endpoint'
import State from './state'
import { executeAll } from './async'
import { RequestOptions, IncomingMessage, ServerResponse } from 'http'

class Detective {
  name: string
  dependencies: Dependency[]
  endpoints: Endpoint[]
  constructor (name: string) {
    this.name = name
    this.dependencies = []
    this.endpoints = []
  }
  dependency (name: string): Dependency {
    const d = new Dependency(name)
    this.dependencies.push(d)
    return d
  }
  endpoint (url: string, options?: RequestOptions) {
    const e = new Endpoint(this.name, url, options)
    this.endpoints.push(e)
  }
  getState (fromChain: string[], cb: callbackWithState) {
    const getDependencyStates = this.dependencies.map((d) => d.getState.bind(d))
    const newFromChainHeader = [ ...fromChain, this.name ]
    const getEndpointStates =
      fromChain.indexOf(this.name) >= 0
        ? []
        : this.endpoints.map((e) => e.getState(newFromChainHeader.join('|')).bind(e))
    const s = new State(this.name)

    executeAll([ ...getDependencyStates, ...getEndpointStates ], (states) => {
      cb(s.withDependencies(states))
    })
  }
  handler (): (req: IncomingMessage, res: ServerResponse) => void {
    return (req: IncomingMessage, res: ServerResponse): void => {
      const fromChain: string[] = String(req.headers[fromHeader] || '').split('|').filter((s) => s !== '')
      this.getState(fromChain, (s) => {
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(s))
        res.end()
      })
    }
  }
}

export = Detective
