import http from 'http'
import { callbackWithState } from './dependency'
import State, { iState, stateFromObject } from './state'
import { parse } from 'url'

/**
 * @ignore
 */
export const fromHeader = 'x_detective_from_chain'

/**
 * @ignore
 */
export default class Endpoint {
  private name: string
  private options: http.RequestOptions

  constructor (name: string, url: string, options: http.RequestOptions = {}) {
    this.name = name
    const parsedUrl = parse(url)
    const parsedOptions: http.RequestOptions = {}
    parsedOptions.protocol = parsedUrl.protocol
    parsedOptions.hostname = parsedUrl.hostname
    parsedOptions.path = parsedUrl.path
    parsedOptions.port = parseInt(parsedUrl.port || '80')
    parsedOptions.headers = {
      'Content-Type': 'application/json'
    }
    this.options = Object.assign(parsedOptions, options)
  }

  getState (fromChain: string): (cb: callbackWithState) => void {
    return (cb: callbackWithState) => {
      const state = new State(this.name)
      this.options.headers = this.options.headers || {}
      this.options.headers[fromHeader] = fromChain || ''
      const req = http.request(this.options, (res) => {
        if (res.statusCode != 200) {
          const err = new Error('HTTP request received unexpected status: ' + res.statusCode)
          state.withError(err)
          cb(state)
          return
        }
        this.getStateFromResponse(res, (s) => {
          state.withOk()
          s.latency = state.latency
          cb(s)
        })
      })
      req.on('error', (err) => {
        state.withError(err)
        cb(state)
      })
      req.end()
    }
  }

  private getStateFromResponse = (res: http.IncomingMessage, cb: callbackWithState) => {
    let resStr = ''
    res.setEncoding('utf8')
    const state = new State(this.name)
    res.on('data', (chunk) => {
      resStr += chunk
    })
    res.on('end', () => {
      let stateObj: iState
      try {
        stateObj = JSON.parse(resStr)
      } catch (e) {
        state.withError(e)
        cb(state)
        return
      }
      cb(stateFromObject(stateObj))
    })
  }
}
