import CommonModel from './common.model'

const user = {
  userId: { type: String, required: true },
  userFirstName: { type: String, required: true },
  userLastName: { type: String, required: true },
  userEmail: { type: String, required: true }
}

const payFees = {
  collections: { type: Boolean, required: true },
  processing: { type: Boolean, required: true }
}

const processingFees = {
  cardFee: { type: Number, required: true },
  cardFeeFlat: { type: Number, required: true },
  achFee: { type: Number, required: true },
  achFeeFlat: { type: Number, required: true },
  achFeeCap: { type: Number, required: true }
}

const paymentDetails = {
  externalCustommerId: { type: String, required: true },
  statementDescriptor: { type: String, required: true },
  paymentMethodtype: { type: String, required: true, enum: ['card', 'bank_account'] },
  externalPaymentMethodId: { type: String, required: true },
  brand: { type: String, required: true },
  last4: { type: String, required: true }
}

const customInfo = {
  label: { type: String, required: true },
  value: { type: String, required: true },
  displayed: { type: Boolean, required: true }
}

const collectionFees = {
  fee: { type: Number, required: true },
  feeFlat: { type: Number, required: true }
}

const schema = {
  invoiceId: { type: String, required: true },
  label: { type: String, required: true },

  organizationId: { type: String, required: true },
  organizationName: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String },
  beneficiaryId: { type: String, required: true },
  beneficiaryFirstName: { type: String, required: true },
  beneficiaryLastName: { type: String, required: true },
  season: { type: String, required: true },
  customInfo: { type: [customInfo], default: [] },

  connectAccount: { type: String, required: true },
  dateCharge: { type: Date, required: true },
  maxDateCharge: { type: Date },
  chargedOn: { type: Date },
  chargeId: { type: String },
  price: { type: Number, required: true },
  priceBase: { type: Number, required: true },
  paidupFee: { type: Number, required: true },
  stripeFee: { type: Number, required: true },
  totalFee: { type: Number, required: true },
  notes: { type: [String], default: [] },
  user: { type: user, required: true },
  processingFees: { type: processingFees, required: true },
  paymentDetails: { type: paymentDetails, required: true },
  payFees: { type: payFees, required: true },
  attempts: { type: Array, default: [] },
  tags: { type: [String] },
  unbundle: { type: Boolean },
  collectionFees: { type: collectionFees },
  status: { type: String, required: true, default: 'autopay', enum: ['paidup', 'autopay', 'failed', 'refunded'] }
}

export default class InvoiceModel extends CommonModel {
  constructor () {
    super('invoice', 'invoices', schema)
  }
}
