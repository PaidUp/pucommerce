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
  beneficiaryKey: { type: String, required: true },
  beneficiaryFirstName: { type: String, required: true },
  beneficiaryLastName: { type: String, required: true },
  planId: { type: String },
  planDescription: { type: String },
  assigneeEmail: { type: String, required: true },
  customInfo: { type: [ customInfo ] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}

export default class PreorderModel extends CommonModel {
  constructor () {
    super('preorder', 'preorders', schema)
  }
}
