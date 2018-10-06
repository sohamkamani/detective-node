import Dependency, { callbackWithState } from './dependency'
import Endpoint, { fromHeader } from './endpoint'
import State from './state'
import { executeAll } from './async'
import { RequestOptions, IncomingMessage, ServerResponse } from 'http'

/**
 * A Detective instance manages registered dependencies and endpoints.
 * Dependencies can be registered with an instance.
 * Each instance has a state which represents the health of its components.
 */
class Detective {
  private name: string
  private dependencies: Dependency[]
  private endpoints: Endpoint[]

  /**
   * 
   * @param name Name of the application. Names of a connected group of detective instances should be unique among that group
   */
  constructor (name: string) {
    this.name = name
    this.dependencies = []
    this.endpoints = []
  }

  /**
   * Adds a new dependency to the Detective instance. The name provided should preferably be unique among dependencies registered within the same detective instance.
   * @param name Name of the dependency
   */
  dependency (name: string): Dependency {
    const d = new Dependency(name)
    this.dependencies.push(d)
    return d
  }

  /**
   * Adds an HTTP endpoint as a dependency to the Detective instance, thereby allowing you to compose detective instances. This method creates a GET request to the provided url. If you want to customize the request (like using a different HTTP method, or adding headers), consider using the `options` argument.
   * @param url The URL to send the request to
   * @param options Same as https://nodejs.org/api/http.html#http_http_request_url_options_callback
   */
  endpoint (url: string, options?: RequestOptions) {
    const e = new Endpoint(this.name, url, options)
    this.endpoints.push(e)
  }

  /**
   * @ignore
   */
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

  /**
   * Returns a standard HTTP handler function, which can be used with the http standard library module, or frameworks like express
   */
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
