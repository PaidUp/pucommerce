/**
 * Express configuration
 */

import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { Logger, handlerBug } from 'pu-common'
import morgan from 'morgan'
import errorhandler from 'errorhandler'

export default function (app) {
  app.use(handlerBug.requestHandler)
  app.use(cors())
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.raw({
    type: (req) => {
      let contentType = req.headers['content-type']
      return contentType && contentType.includes('application/json')
    }
  }))
  app.use((req, res, next) => {
    let contentType = req.headers['content-type']
    if (contentType && contentType.includes('application/json')) {
      req.rawBody = req.body
      req.body = JSON.parse(req.rawBody.toString())
    }
    next()
  })
  // app.use(bodyParser.json())
  app.use(methodOverride())
  app.use(cookieParser())
  app.use((req, res, next) => {
    let msg = `database connection status ${mongoose.connection.readyState}`
    if (mongoose.connection.readyState !== 1) {
      Logger.critical(msg)
      return res.status(500).json(msg)
    }
    next()
  })
  if (process.env.NODE_ENV === 'local') {
    app.use(errorhandler())
    app.use(morgan('dev'))
  }
  app.use(handlerBug.errorHandler)
}
