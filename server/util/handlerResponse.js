import Logger from '@/util/logger'

export default class HandlerResponse {
  constructor (response) {
    this.response = response
  }

  send (msg) {
    return this.response.status(200).json(msg)
  }

  error (msg, code) {
    Logger.error({code: code, resason: msg})
    return this.response.status(code || 500).json(msg)
  }
}
