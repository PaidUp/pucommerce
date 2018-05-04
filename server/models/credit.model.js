import CommonModel from './common.model'

const schema = {
  memoId: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  beneficiaryId: { type: String, required: true },
  organizationId: { type: String, required: true },
  productId: { type: String, required: true },
  seasonId: { type: String, required: true },
  status: { type: String, enum: ['paid', 'credited', 'partially_refunded', 'refunded'], default: 'active' }
}

export default class CreditMemoModel extends CommonModel {
  constructor () {
    super('credit', 'credits', schema)
  }
}
