import axios from 'axios'
import config from '@/config/environment'

var instance = axios.create({
  baseURL: 'https://app.formapi.io/api/v1/',
  timeout: 3000,
  auth: config.contract
})
let contractService

class ContractService {
  fillForm ({templateId, playerName, signature}) {
    return instance.post(`templates/${templateId}/submissions`, {
      'test': true,
      data: {
        player_name: playerName,
        signature: {
          base64: signature
        }
      }
    })
  }

  urlContract (submissionId) {
    return instance.get(`submissions/${submissionId}`)
  }
}

contractService = new ContractService()

export default contractService
