import CommonModel from './common.model'

const dues = {
  description: { type: String, required: true },
  dateCharge: { type: Date, required: true },
  maxDateCharge: { type: Date },
  amount: { type: Number, required: true }
}

const schema = {
  organizationId: { type: String, required: true },
  productId: { type: String },
  productName: { type: String },
  season: { type: String },
  beneficiaryId: { type: String, required: true },
  planId: { type: String },
  assigneeEmail: { type: String, required: true },
  dues: { type: [dues] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}

export default class PreorderModel extends CommonModel {
  constructor () {
    super('preorder', 'preorders', schema)
  }
}
