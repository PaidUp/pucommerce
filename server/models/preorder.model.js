import CommonModel from './common.model'

const customInfo = {
  model: { type: String, required: true },
  value: { type: String, required: true }
}

const schema = {
  organizationId: { type: String, required: true },
  organizationName: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  beneficiaryId: { type: String, required: true },
  beneficiaryName: { type: String, required: true },
  planId: { type: String, required: true },
  planDescription: { type: String, required: true },
  assigneeEmail: { type: String, required: true },
  customInfo: { type: [customInfo] },
  status: { type: String, required: true, enum: ['active', 'inactive'] },
  createOn: { type: Date, default: Date.now },
  updateOn: { type: Date, default: Date.now }
}

export default class OrderModel extends CommonModel {
  constructor () {
    super('order', 'orders', schema)
  }
}
