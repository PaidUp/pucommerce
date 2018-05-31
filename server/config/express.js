/**
 * Express configuration
 */

import compression from 'compression'
import cors from 'cors'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { Logger } from 'pu-common'
import morgan from 'morgan'
import errorhandler from 'errorhandler'
import pmx from 'pmx'

export default function (app) {
  app.use(cors())
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.raw({type: '*/*'}))
  app.use((req, res, next) => {
    req.rawBody = req.body
    if (Object.keys(req.rawBody).length > 0) {
      req.body = JSON.parse(req.rawBody.toString())
    }
    next()
  })
  // app.use(bodyParser.json())
  app.use(methodOverride())
  app.use(cookieParser())
  app.use(pmx.expressErrorHandler())
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
}
