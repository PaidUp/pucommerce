import CommonModel from './common.model'
import { Schema } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

const schema = {
  memoId: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  orderId: { type: ObjectId, required: true, ref: 'pu_commerce_orders' },
  status: { type: String, enum: ['paid', 'credited', 'partially_refunded', 'refunded'], default: 'active' }
}

export default class CreditMemoModel extends CommonModel {
  constructor () {
    super('credit', 'credits', schema)
  }
}
