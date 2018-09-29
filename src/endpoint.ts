import http from 'http'
import timer from './timer'
import { callbackWithState } from './dependency'
import State, { iState, stateFromObject } from './state'
import { parse } from 'url'

export default class Endpoint {
  name: string
  options: http.RequestOptions

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

  getState (cb: callbackWithState) {
    const timerDone = timer()
    const state = new State(this.name)
    const req = http.request(this.options, (res) => {
      const latency = timerDone()
      state.latency = latency
      if (res.statusCode != 200) {
        const err = new Error('HTTP request received unexpected status: ' + res.statusCode)
        state.withError(err)
        cb(state)
        return
      }
      this.getStateFromResponse(res, cb)
    })
    req.on('error', (err) => {
      const latency = timerDone()
      state.latency = latency
      state.withError(err)
      cb(state)
    })
    req.end()
  }

  getStateFromResponse = (res: http.IncomingMessage, cb: callbackWithState) => {
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
