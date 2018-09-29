import { assert } from 'chai'
import http from 'http'
import Endpoint from './endpoint'

describe('endpoint', function () {
  this.timeout(1000)
  it('should get state from remote endpoint', (done) => {
    const port = 9091
    http
      .createServer((req, res) => {
        res.write(`{
        "name": "Another application",
        "active": false,
        "status": "Error: dependency failure",
        "latency": 0,
        "dependencies": [
          {
            "name": "cache",
            "active": true,
            "status": "Ok",
            "latency": 51336919
          },
          {
            "name": "db",
            "active": false,
            "status": "Error: fail",
            "latency": 51471274
          }
        ]
      }`)
        res.end()
      })
      .listen(port)
    const ep = new Endpoint('sample', 'http://127.0.0.1:' + port)
    ep.getState((state) => {
      const expectedSubObject = {
        name: 'Another application',
        active: false,
        status: 'Error: dependency failure'
      }
      const expectedDependencies = [
        {
          name: 'cache',
          active: true,
          status: 'Ok'
        },
        {
          name: 'db',
          active: false,
          status: 'Error: fail'
        }
      ]
      assert.deepInclude(state, expectedSubObject)
      assert.lengthOf(state.dependencies, 2)
      assert.deepInclude(state.dependencies[0], expectedDependencies[0])
      assert.deepInclude(state.dependencies[1], expectedDependencies[1])
      done()
    })
  })
})
