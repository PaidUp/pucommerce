import CommonModel from './common.model'
import { Schema } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

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

const schema = {
  invoiceId: { type: String, required: true },
  orderId: { type: ObjectId, required: true, ref: 'pu_commerce_orders' },
  label: { type: String, required: true },
  connectAccount: { type: String, required: true },
  dataCharge: { type: Date, required: true },
  chargedOn: { type: Date },
  chargeId: { type: String },
  price: { type: Number, required: true },
  priceBase: { type: Number, required: true },
  paidupFee: { type: Number, required: true },
  notes: { type: [String], default: [] },
  user: { type: user, required: true },
  processingFees: { type: processingFees, required: true },
  paymentDetails: { type: paymentDetails, required: true },
  payFees: { type: payFees, required: true },
  attempts: { type: Array, default: [] },
  status: { type: String, required: true, default: 'autopay', enum: ['autopay', 'charged', 'failed', 'refunded'] }
}

export default class InvoiceModel extends CommonModel {
  constructor () {
    super('invoice', 'invoices', schema)
  }
}
