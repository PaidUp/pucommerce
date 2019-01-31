import express from 'express'
import mongoose from 'mongoose'
import config from './config/environment'
import configExpress from './config/express'
import routes from './routes'
import { auth, Logger, Sequence, handlerBug } from 'pu-common'

handlerBug.init(config.bugsnag)
auth.config = config.auth
Logger.setConfig(config.logger)
Sequence.setConfig(config.sequence)

process.env.NODE_ENV = process.env.NODE_ENV || 'local'

const app = express()
// const server = http.createServer(app)
configExpress(app)
routes(app)

// Start server
var server = app.listen(config.port, config.ip, function () {
  mongoose.connect(config.mongo.uri, config.mongo.options, error => {
    if (error) {
      handlerBug.notify(error)
      return Logger.error(error)
    }
    Logger.info('Connected to database')
  })
  Logger.info(`pu-commerce listening on ${config.port}, in ${app.get('env')} mode`)
})

process.on('exit', (cb) => {
  mongoose.connection.close()
  console.log('bye......')
})

process.on('unhandledRejection', (err) => {
  throw err
})
process.on('uncaughtException', (err) => {
  handlerBug.notify(err)
  Logger.critical(err)
  if (process.env.NODE_ENV === 'test') {
    process.exit(1)
  }
})

export default server
