import { assert } from 'chai'
import Dependency from './dependency'

describe('dependency', () => {
  it('gets state when detector fn returns success', (done) => {
    const d = new Dependency('test dependency')
    d.detect((cb) => {
      setTimeout(() => cb(), 100)
    })
    d.getState((state) => {
      assert.isTrue(state.active)
      assert.equal(state.status, 'Ok')
      assert.isAbove(state.latency, 100000000)
      assert.isBelow(state.latency, 120000000)
      done()
    })
  })

  it('gets state when detector fn returns failure', (done) => {
    const d = new Dependency('test dependency')
    d.detect((cb) => {
      const err = new Error('failed')
      setTimeout(() => cb(err), 100)
    })
    d.getState((state) => {
      assert.isFalse(state.active)
      assert.equal(state.status, 'Error: failed')
      assert.isAbove(state.latency, 100000000)
      assert.isBelow(state.latency, 120000000)
      done()
    })
  })
})
