import CommonModel from './common.model'

const schema = {
  memoId: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  beneficiaryId: { type: String, required: true },
  assigneeEmail: { type: String, required: true },
  organizationId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  season: { type: String, required: true },
  status: { type: String, enum: ['paid', 'credited', 'refunded', 'discount'] }
}

export default class CreditMemoModel extends CommonModel {
  constructor () {
    super('credit', 'credits', schema)
  }
}
