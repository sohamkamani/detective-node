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
})
