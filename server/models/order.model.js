import CommonModel from './common.model'

const schema = {
  organizationId: { type: String, required: true },
  organizationName: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  beneficiaryId: { type: String, required: true },
  beneficiaryName: { type: String, required: true },
  status: { type: String, required: true, enum: ['active', 'inactive'] }
}

export default class OrderModel extends CommonModel {
  constructor () {
    super('order', 'orders', schema)
  }
}
