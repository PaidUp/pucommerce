import CommonModel from './common.model'

const customInfo = {
  model: { type: String, required: true },
  value: { type: String, required: true }
}

const schema = {
  organizationId: { type: String, required: true },
  organizationName: { type: String, required: true },
  productId: { type: String },
  productName: { type: String },
  productImage: { type: String },
  beneficiaryId: { type: String, required: true },
  beneficiaryName: { type: String, required: true },
  planId: { type: String },
  planDescription: { type: String },
  assigneeEmail: { type: String, required: true },
  customInfo: { type: [ customInfo ] },
  status: { type: String, required: true, enum: ['active', 'inactive'] }
}

export default class OrderModel extends CommonModel {
  constructor () {
    super('order', 'orders', schema)
  }
}
