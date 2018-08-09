import { CreditModel } from '@/models'
import CommonService from './common.service'
import { Sequence } from 'pu-common'

let creditService

function generateCredits (order, credits, user) {
  return Sequence.next('credit', credits.length).then(seqs => {
    let crds = []
    for (let index = 0; index < credits.length; index++) {
      const seq = 'CRD' + seqs.ids[index].toUpperCase()
      const credit = credits[index]
      crds.push({
        memoId: seq,
        label: credit.description,
        description: credit.description,
        price: credit.amount,
        beneficiaryId: order.beneficiaryId,
        assigneeEmail: user.email,
        productId: order.productId,
        productName: order.productName,
        organizationId: order.organizationId,
        season: order.season,
        tags: credit.tags,
        status: credit.status,
        createOn: new Date(credit.dateCharge)
      })
    }
    return crds
  })
}

class CreditService extends CommonService {
  constructor () {
    super(new CreditModel())
  }

  checkout (order, credits, user) {
    return new Promise((resolve, reject) => {
      generateCredits(order, credits, user).then(crds => {
        this.insertMany(crds).then(result => resolve(result))
      }).catch(reason => reject(reason))
    })
  }

  add ({ label, description, price, beneficiaryId, assigneeEmail, productId, productName, organizationId, season, status, createOn }) {
    return Sequence.next('credit').then(values => {
      let memoId = 'CRD' + values.ids[0].toUpperCase()
      return this.save({ memoId, label, description, price, beneficiaryId, assigneeEmail, productId, productName, organizationId, season, status, createOn })
    })
  }
}

creditService = new CreditService()

export default creditService
