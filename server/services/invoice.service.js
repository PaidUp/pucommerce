import { InvoiceModel } from '@/models'
import CommonService from './common.service'
import axios from 'axios'
import { Sequence } from 'pu-common'
import config from '@/config/environment'
import { productPriceV2 } from 'machinepack-calculations'

let invoiceService
let apiOrganization = axios.create({
  baseURL: config.api.organization.url,
  timeout: 10000,
  headers: {'x-api-key': config.auth.key}
})

let apiUser = axios.create({
  baseURL: config.api.user.url,
  timeout: 10000,
  headers: {'x-api-key': config.auth.key}
})

function getOrganization (organizationId) {
  return apiOrganization.get(`/${organizationId}`)
}

function calculations (product, due, order, organization, user, seq) {
  return new Promise((resolve, reject) => {
    productPriceV2({
      type: due.account.object,
      capAmount: product.processingFees.achFeeCap,
      originalPrice: due.amount,
      stripePercent: product.processingFees.cardFee,
      stripeFlat: product.processingFees.cardFeeFlat,
      stripeAchPercent: product.processingFees.achFee,
      stripeAchFlat: product.processingFees.achFeeFlat,
      paidUpFee: product.collectionFees.fee,
      paidUpFlat: product.collectionFees.feeFlat,
      discount: 0,
      payProcessing: product.payFees.processing,
      payCollecting: product.payFees.collect
    }).exec(
      {
        error: function (err) {
          reject(err)
        },
        success: function (result) {
          let invoice = {
            invoiceId: 'INV' + seq.toUpperCase(),
            label: due.description,
            organizationId: order.organizationId,
            organizationName: order.organizationName,
            productId: order.productId,
            productName: order.productName,
            productImage: order.productImage,
            beneficiaryId: order.beneficiaryId,
            beneficiaryFirstName: order.beneficiaryFirstName,
            beneficiaryLastName: order.beneficiaryLastName,
            season: order.season,
            connectAccount: organization.connectAccount,
            dateCharge: due.dateCharge,
            maxDateCharge: due.maxDateCharge,
            price: due.amount,
            priceBase: result.basePrice,
            paidupFee: result.feePaidUp,
            stripeFee: result.feeStripe,
            totalFee: result.totalFee,
            user: {
              userId: user._id,
              userFirstName: user.firstName,
              userLastName: user.lastName,
              userEmail: user.email
            },
            payFees: product.payFees,
            processingFees: product.processingFees,
            paymentDetails: {
              externalCustomerId: user.externalCustomerId,
              statementDescriptor: product.statementDescriptor,
              paymentMethodtype: due.account.object,
              externalPaymentMethodId: due.account.id,
              brand: due.account.brand || due.account.bank_name,
              last4: due.account.last4
            },
            status: 'autopay'
          }
          resolve(invoice)
        }
      }
    )
  })
}

function generateInvoices (order, dues, product, user) {
  let calcPromises = []
  let organization
  return new Promise((resolve, reject) => {
    getOrganization(order.organizationId).then(response => {
      organization = response.data
      return Sequence.next('invoice', dues.length)
    }).then(seqs => {
      for (let idx = 0; idx < dues.length; idx++) {
        calcPromises.push(calculations(product, dues[idx], order, organization, user, seqs.ids[idx]))
      }
      Promise.all(calcPromises).then(values => {
        return resolve(values)
      })
    })
  })
}

class InvoiceService extends CommonService {
  constructor () {
    super(new InvoiceModel())
  }

  checkout ({order, dues, product, user}) {
    return new Promise((resolve, reject) => {
      apiUser.get(`/id/${user._id}`)
        .then(response => {
          generateInvoices(order, dues, product, response.data).then(invoices => {
            this.insertMany(invoices).then(result => resolve(result))
          })
        }).catch(reason => reject(reason))
    })
  }

  addNote ({ id, note }) {
    return this.model.updateById(id, { $push: { notes: note } })
  }
}

invoiceService = new InvoiceService()

export default invoiceService
