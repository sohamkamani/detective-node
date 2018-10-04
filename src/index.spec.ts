import Detective from './'
import http from 'http'
import { assert } from 'chai'
import { fromHeader } from './endpoint'

describe('detective', function () {
  it('should get the state of its dependencies', (done) => {
    const port: number = 9091
    let called: boolean = false
    const server = http.createServer((req, res) => {
      called = true
      assert.equal(req.headers[fromHeader], 'app1|sample app')
      res.write(`{
        "name": "Another application",
        "active": true,
        "status": "Ok",
        "latency": 0,
        "dependencies": [
          {
            "name": "cache",
            "active": true,
            "status": "Ok",
            "latency": 51336919
          }
        ]
      }`)
      res.end()
    })

    server.listen(port)

    const d = new Detective('sample app')
    d.dependency('dep1').detect((cb) => {
      setTimeout(() => cb(), 100)
    })
    d.dependency('dep2').detect((cb) => {
      setTimeout(() => cb(), 50)
    })
    d.endpoint('http://localhost:' + port)
    d.getState([ 'app1' ], (s) => {
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
        },
        {
          name: 'Another application',
          active: true,
          status: 'Ok'
        }
      ]
      assert.nestedInclude(s, expectedState)
      assert.lengthOf(s.dependencies, 3)
      assert.deepNestedInclude(s.dependencies[0], expectedDependecyStates[0])
      assert.deepNestedInclude(s.dependencies[1], expectedDependecyStates[1])
      assert.deepNestedInclude(s.dependencies[2], expectedDependecyStates[2])

      server.close()
      done()
    })
  })

  it('should not get the state of its endpoint if the fromHeader contains app name', (done) => {
    const d = new Detective('sample app')
    d.dependency('dep1').detect((cb) => {
      setTimeout(() => cb(), 100)
    })
    d.endpoint('http://localhost:8091/')
    d.getState([ 'app1', 'sample app', 'app2' ], (s) => {
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
        }
      ]
      assert.nestedInclude(s, expectedState)
      assert.lengthOf(s.dependencies, 1)
      assert.deepNestedInclude(s.dependencies[0], expectedDependecyStates[0])
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

  it('handler should get the state of its dependencies', (done) => {
    const d = new Detective('sample app')
    d.dependency('dep1').detect((cb) => {
      setTimeout(() => cb(), 100)
    })
    d.dependency('dep2').detect((cb) => {
      setTimeout(() => cb(), 50)
    })
    const h = d.handler()
    const mockRes = new mockResponse()
    mockRes.onEnd((res) => {
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
      const s = JSON.parse(res)
      assert.nestedInclude(s, expectedState)
      assert.lengthOf(s.dependencies, 2)
      assert.deepNestedInclude(s.dependencies[0], expectedDependecyStates[0])
      assert.deepNestedInclude(s.dependencies[1], expectedDependecyStates[1])
      done()
    })
    //@ts-ignore
    h({ headers: {} }, mockRes)
  })
})

class mockResponse {
  data: string
  cb: (d: string) => void
  constructor () {
    this.data = ''
    this.cb = () => {}
  }
  write (d: string): void {
    this.data += d
  }
  setHeader (k: string, v: string) {}
  end () {
    this.cb(this.data)
  }
  onEnd (cb: (d: string) => void) {
    this.cb = cb
  }
}
