import axios from 'axios'
import config from '@/config/environment'

export default class ApiService {
  static get organization () {
    return axios.create({
      baseURL: config.api.organization.url,
      timeout: 10000,
      headers: {'x-api-key': config.auth.key}
    })
  }

  static get user () {
    return axios.create({
      baseURL: config.api.user.url,
      timeout: 10000,
      headers: {'x-api-key': config.auth.key}
    })
  }
}
