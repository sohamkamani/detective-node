const express = require('express')
const Detective = require('../out')

// Create a new detective instance
const detective = new Detective('app')

// Initialize an arbitrary dependency, and set its detector function
detective.dependency('cache').detect((cb) => {
  // The detector function is supplied with a callback argument
  // `cb` should be called with no arguments for a successful check
  // or with a single argument (typically an `Error` type) for a failed dependency
  setTimeout(() => cb(), 100)
})

detective.dependency('db').detect((cb) => {
  setTimeout(() => cb(), 250)
})

// The `handler` method returns an http handler that can be used with
// the standard node HTTP server
const app = express()
app.get('/ping', detective.handler())
app.listen(8081)
