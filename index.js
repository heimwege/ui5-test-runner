#!/usr/bin/env node

'use strict'

const { join } = require('path')
const endpoints = require('./src/endpoints')
const { instrument, mappings: coverage } = require('./src/coverage')
const ui5 = require('./src/ui5')
const executeTests = require('./src/tests')
const { check, log, serve } = require('reserve')

const job = require('./src/job')

async function main () {
  const configuration = await check({
    port: job.port,
    mappings: [
      ...endpoints,
      ...ui5,
      ...coverage, {
        // Project mapping
        match: /^\/(.*)/,
        file: join(job.webapp, '$1')
      }]
  })
  const server = serve(configuration)
  if (job.logServer) {
    log(server)
  }
  server
    .on('ready', async ({ url, port }) => {
      job.port = port
      if (!job.logServer) {
        console.log(`Server running at ${url}`)
      }
      await instrument()
      executeTests()
    })
}

main()
