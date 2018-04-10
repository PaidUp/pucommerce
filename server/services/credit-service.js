import { CreditModel } from '@/models'
import CommonService from './common.service'
import { Sequence } from 'pu-common'

let creditService

class CreditService extends CommonService {
  constructor () {
    super(new CreditModel())
  }

  add ({label, description, price, orderId, status}) {
    return Sequence.next('cmemo').then(values => {
      let memoId = 'CMEMO' + values.ids[0]
      return this.save({ memoId, label, description, price, orderId, status })
    })
  }
}

creditService = new CreditService()

export default creditService
