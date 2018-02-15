import { OrderModel } from '@/models'
import CommonService from './common.service'
import axios from 'axios'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNvbnRhY3RzIjpbXSwicm9sZXMiOlsicGFyZW50Il0sImNyZWF0ZU9uIjoiMjAxOC0wMi0xNVQxODoxNjoyNS43NTBaIiwidXBkYXRlT24iOiIyMDE4LTAyLTE1VDE4OjE2OjI1Ljc1MFoiLCJfaWQiOiI1YTg1Y2U3OTU5MWU4NzIxMThiOTkzOGMiLCJmaXJzdE5hbWUiOiJ0ZXN0IiwibGFzdE5hbWUiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGdldHBhaWR1cC5jb20iLCJ0eXBlIjoiY3VzdG9tZXIiLCJzYWx0IjoiZDhoVmh1UzZMSmgrV2gvMWpqMWYvQT09IiwiaGFzaGVkUGFzc3dvcmQiOiJTVkN5b0RRcVVmWS9McWdIUmFqanU1RGhDTVd3UU9oTlJzSDRNTzhoZjExZ2g3K1QwbmRIbmRnbjV4UDYvOHlKMTVYRmZBanFhKzliTGNWRmRMcDdqdz09IiwiX192IjowfSwiaWF0IjoxNTE4NzE4NjIzLCJleHAiOjM0MTA4Nzg2MjN9.tLvpo_aejNOB4fuIHvYHxdTBkEWxjGT0nspqtX2yzUQ'

const orderModel = new OrderModel()

export default class UserService extends CommonService {
  constructor () {
    super(orderModel)
  }

  save (entity) {
    return new Promise((resolve, reject) => {
      this.model.save(entity).then(entity => {
        axios.get('https://devapi.getpaidup.com/api/v1/organization/plan/5a859d2103db500098c46dda/join')
          .then(response => {
            console.log('Data: ', response.data)
            resolve(entity)
          })
          .catch(error => {
            console.log(error)
            reject(entity)
          })
      })
    })
  }
}
