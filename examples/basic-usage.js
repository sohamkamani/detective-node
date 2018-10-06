const http = require('http')
const Detective = require('detective-node')

const detective = new Detective('app')

detective.dependency('cache').detect((cb) => {
  setTimeout(() => cb(), 100)
})

detective.dependency('db').detect((cb) => {
  setTimeout(() => cb(), 250)
})

const server = http.createServer(detective.handler())

server.listen(8081)
