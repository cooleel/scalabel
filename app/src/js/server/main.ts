import express, { Application } from 'express'
import * as formidable from 'express-formidable'
import { createServer } from 'http'
import * as socketio from 'socket.io'
import { startSocketServer } from './hub'
import * as listeners from './listeners'
import { getAbsoluteSrcPath, HTMLDirectories } from './path'
import Session from './server_session'
import { Endpoint } from './types'
import { initEnv, initStorage } from './util'

/**
 * Sets up http handlers
 */
function startHTTPServer (app: Application) {
  // set up static handlers for serving html
  // TODO: set up '/' endpoint
  for (const HTMLDir of HTMLDirectories) {
    app.use(express.static(
      getAbsoluteSrcPath(HTMLDir), { extensions: ['html'] }))
  }

  // set up static handlers for serving javascript
  app.use('/js', express.static(getAbsoluteSrcPath('/')))

  // set up post/get handlers
  // TODO: set up other endpoints
  app.get(Endpoint.GET_PROJECT_NAMES, listeners.ProjectNameHandler)
  app.post(Endpoint.POST_PROJECT, listeners.PostProjectHandler)
}

/**
 * Main function for backend server
 */
function main () {
  // init global env
  initEnv()
  const env = Session.getEnv()

  // init global storage
  initStorage(env)

  // start http and socket io servers
  const app: Application = express()
  const httpServer = createServer(app)
  const io = socketio(httpServer)

  // set up middleware
  app.use(listeners.LoggingHandler)
  app.use(formidable()) // handles posted form data

  // set up http handlers
  startHTTPServer(app)

  // set up socket.io handler
  startSocketServer(io)

  httpServer.listen(env.port)
}

main()
