import Detective from './'
import { assert } from 'chai'

describe('detective', function () {
  it('should get the state of its dependencies', (done) => {
    const d = new Detective('sample app')
    d.dependency('dep1').detect((cb) => {
      setTimeout(() => cb(), 100)
    })
    d.dependency('dep2').detect((cb) => {
      setTimeout(() => cb(), 50)
    })
    d.getState([], (s) => {
      const expectedState = {
        name: 'sample app',
        active: true,
        status: 'Ok'
      }
      const expectedDependecyStates = [
        {
          name: 'dep1',
          active: true,
          status: 'Ok',
          dependencies: []
        },
        {
          name: 'dep2',
          active: true,
          status: 'Ok',
          dependencies: []
        }
      ]
      assert.nestedInclude(s, expectedState)
      assert.lengthOf(s.dependencies, 2)
      assert.deepNestedInclude(s.dependencies[0], expectedDependecyStates[0])
      assert.deepNestedInclude(s.dependencies[1], expectedDependecyStates[1])
      done()
    })
  })

  it('should get a failed state if one of its dependencies fails', (done) => {
    const d = new Detective('sample app')
    d.dependency('dep1').detect((cb) => {
      setTimeout(() => cb(), 100)
    })
    d.dependency('dep2').detect((cb) => {
      setTimeout(() => cb(new Error('failed')), 50)
    })
    d.getState([], (s) => {
      const expectedState = {
        name: 'sample app',
        active: false,
        status: 'Error: dependency failure'
      }
      const expectedDependecyStates = [
        {
          name: 'dep1',
          active: true,
          status: 'Ok',
          dependencies: []
        },
        {
          name: 'dep2',
          active: false,
          status: 'Error: failed',
          dependencies: []
        }
      ]
      assert.nestedInclude(s, expectedState)
      assert.lengthOf(s.dependencies, 2)
      assert.deepNestedInclude(s.dependencies[0], expectedDependecyStates[0])
      assert.deepNestedInclude(s.dependencies[1], expectedDependecyStates[1])
      done()
    })
  })
})
