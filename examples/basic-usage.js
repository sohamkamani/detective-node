const http = require('http')
// const bodyParser = require('body-parser')
// const Detective = require('detective').Detective

// const detective = new Detective()
// const dep1 = detective.dependency('cache')

// dep1.detect((cb) => {
//   setInterval(() => cb(), 1000)
// })

// const middleware = bodyParser.json()

const server = http.createServer((req, res) => {
  req.on('data', (chunk) => console.log('received chunk:', chunk.toString()))
  req.on('end', () => {
    res.statusCode = 204
    res.end()
  })
})

server.listen(8000)
