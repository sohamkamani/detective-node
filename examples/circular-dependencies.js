const http = require('http')
const Detective = require('../out')

const detective1 = new Detective('app')

detective1.dependency('cache').detect((cb) => {
  setTimeout(() => cb(), 100)
})

detective1.dependency('db').detect((cb) => {
  setTimeout(() => cb(), 250)
})

detective1.endpoint('http://localhost:8082')

const server1 = http.createServer(detective1.handler())

server1.listen(8081)

const detective2 = new Detective('app2')

detective2.dependency('cache2').detect((cb) => {
  setTimeout(() => cb(), 100)
})

detective2.dependency('db2').detect((cb) => {
  setTimeout(() => cb(new Error('failed')), 50)
})

detective2.endpoint('http://localhost:8081')

const server2 = http.createServer(detective2.handler())

server2.listen(8082)
