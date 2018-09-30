import Dependency, { callbackWithState } from './dependency'
import Endpoint from './endpoint'
import State from './state'
import { toPromise, executeAll } from './async'
import { RequestOptions } from 'http'

export default class Detective {
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
  endpoint (url: string, options: RequestOptions) {
    const e = new Endpoint(this.name, url, options)
    this.endpoints.push(e)
  }
  getState (fromChain: string[], cb: callbackWithState) {
    const getDependencyStates = this.dependencies.map((d) => d.getState.bind(d))
    const getEndpointStates = this.endpoints.map((e) => e.getState.bind(e))

    const s = new State(this.name)

    executeAll([ ...getDependencyStates, ...getEndpointStates ], (states) => {
      cb(s.withDependencies(states))
    })
    // Promise.all([ getDependencyStates, getEndpointStates ])
    //   .then((allStates) => {
    //     cb(s.withDependencies([ ...allStates[0], ...allStates[1] ]))
    //   })
    //   .catch((err) => {
    //     cb(s.withError(err))
    //   })
  }
}
