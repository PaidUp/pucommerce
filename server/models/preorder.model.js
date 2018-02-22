import CommonModel from './common.model'

const customInfo = {
  label: { type: String, required: true },
  value: { type: String, required: true },
  displayed: { type: Boolean, required: true }
}

const schema = {
  orderId: { type: String, required: true },
  organizationId: { type: String, required: true },
  organizationName: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  beneficiaryId: { type: String, required: true },
  beneficiaryName: { type: String, required: true },
  customInfo: { type: [customInfo], default: [] },
  status: { type: String, required: true, enum: ['active', 'inactive'] }
}

export default class OrderModel extends CommonModel {
  constructor () {
    super('order', 'orders', schema)
  }
}
