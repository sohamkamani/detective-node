import { assert } from 'chai'
import http from 'http'
import Endpoint from './endpoint'

describe('endpoint', function () {
  this.timeout(1000)
  it('should get state from remote endpoint', (done) => {
    const port = 9091
    const server = http.createServer((req, res) => {
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

    server.listen(port)
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
      server.close()
    })
  })

  it('should get failed state if remote endpoint returns unexpected status', (done) => {
    const port = 9091
    const server = http.createServer((req, res) => {
      res.statusCode = 500
      res.write('{"error":true}')
      res.end()
    })

    server.listen(port)
    const ep = new Endpoint('sample', 'http://127.0.0.1:' + port)
    ep.getState((state) => {
      const expectedSubObject = {
        name: 'sample',
        active: false,
        status: 'Error: HTTP request received unexpected status: 500',
        dependencies: []
      }
      assert.deepInclude(state, expectedSubObject)
      assert.lengthOf(state.dependencies, 0)
      done()

      server.close()
    })
  })

  it('should get failed state if remote endpoint doesnt exist', (done) => {
    const ep = new Endpoint('sample', 'http://127.0.0.1:9092')
    ep.getState((state) => {
      const expectedSubObject = {
        name: 'sample',
        active: false,
        status: 'Error: connect ECONNREFUSED 127.0.0.1:9092',
        dependencies: []
      }
      assert.deepInclude(state, expectedSubObject)
      assert.lengthOf(state.dependencies, 0)
      done()
    })
  })
})
