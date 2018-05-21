import { CreditModel } from '@/models'
import CommonService from './common.service'
import { Sequence } from 'pu-common'

let creditService

function generateCredits (order, credits) {
  return Sequence.next('credit', credits.length).then(seqs => {
    let crds = []
    for (let index = 0; index < credits.length; index++) {
      const seq = seqs.ids[index]
      const credit = credits[index]
      crds.push({
        memoId: seq,
        label: credit.description,
        description: credit.description,
        price: credit.amount,
        beneficiaryId: order.beneficiaryId,
        productId: order.productId,
        organizationId: order.organizationId,
        season: order.season,
        status: credit.status,
        dateCharge: new Date(credit.dateCharge)
      })
    }
    return crds
  })
}

class CreditService extends CommonService {
  constructor () {
    super(new CreditModel())
  }

  checkout (order, credits) {
    return new Promise((resolve, reject) => {
      generateCredits(order, credits).then(crds => {
        this.insertMany(crds).then(result => resolve(result))
      }).catch(reason => reject(reason))
    })
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
