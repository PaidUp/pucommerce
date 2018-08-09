import CommonModel from './common.model'

const dues = {
  description: { type: String, required: true },
  dateCharge: { type: Date, required: true },
  maxDateCharge: { type: Date },
  tags: { type: [String] },
  amount: { type: Number, required: true }
}

const credits = {
  description: { type: String, required: true },
  dateCharge: { type: Date, required: true },
  amount: { type: Number, required: true },
  tags: { type: [String] },
  status: { type: String, enum: ['paid', 'credited', 'refunded', 'discount'], required: true }
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
  credits: { type: [credits] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}

export default class PreorderModel extends CommonModel {
  constructor () {
    super('preorder', 'preorders', schema)
  }
}
