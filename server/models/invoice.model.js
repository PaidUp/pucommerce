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
  type: { type: String, required: true, enum: ['card', 'bank'] },
  externalPaymentMethodId: { type: String, required: true },
  brand: { type: String, required: true },
  last4: { type: String, required: true }
}

const schema = {
  invoiceId: { type: String, required: true },
  orderId: { type: String, required: true },
  label: { type: String, required: true },
  connectAccount: { type: String, required: true },
  dataCharge: { type: Date, required: true },
  chargedOn: { type: Date },
  chargeId: { type: String },
  price: { type: Number, required: true },
  priceBase: { type: Number, required: true },
  paidupFee: { type: Number, required: true },
  user: { type: user, required: true },
  processingFees: { type: processingFees, required: true },
  payFees: { type: payFees, required: true },
  paymentDetails: {type: paymentDetails, required: true},
  status: { type: String, required: true, enum: ['pending', 'charged'] }
}

export default class OrganizationModel extends CommonModel {
  constructor () {
    super('invoice', 'invoices', schema)
  }

  insertMany (arr) {
    return new Promise((resolve, reject) => {
      this.ModelinsertMany(arr, (error, docs) => {
        if (error) return reject(error)
        resolve(docs)
      })
    })
  }
}
