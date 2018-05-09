import CommonModel from './common.model'

// const customInfo = {
//   model: { type: String, required: true },
//   value: { type: String, required: true }
// }

const schema = {
  organizationId: { type: String, required: true },
  productId: { type: String },
  beneficiaryId: { type: String, required: true },
  planId: { type: String },
  assigneeEmail: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}

export default class PreorderModel extends CommonModel {
  constructor () {
    super('preorder', 'preorders', schema)
  }
}
