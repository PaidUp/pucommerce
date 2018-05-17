import { InvoiceModel } from '@/models'
import CommonService from './common.service'
import axios from 'axios'
import { Sequence } from 'pu-common'
import config from '@/config/environment'
import Calculations from './calculations'

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

function calc (type, product, due) {
  let res = {
    priceBase: 0,
    paidupFee: 0
  }
  if (type === 'card') {
    res = Calculations.card(product, due)
  } else if (type === 'bank_account') {
    res = Calculations.bank(product, due)
  }
  return res
}

function generateInvoices (order, dues, product, user) {
  let invoices = []
  let organization
  return getOrganization(order.organizationId).then(response => {
    organization = response.data
    return Sequence.next('invoice', dues.length)
  }).then(seqs => {
    for (let idx = 0; idx < dues.length; idx++) {
      let calculation = calc(dues[idx].account.object, product, dues[idx])
      let invoice = {
        invoiceId: seqs.ids[idx],
        label: dues[idx].description,

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
        dateCharge: dues[idx].dateCharge,
        maxDateCharge: dues[idx].maxDateCharge,
        price: dues[idx].amount,
        priceBase: calculation.priceBase,
        paidupFee: calculation.paidupFee,
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
          paymentMethodtype: dues[idx].account.object,
          externalPaymentMethodId: dues[idx].account.id,
          brand: dues[idx].account.brand || dues[idx].account.bank_name,
          last4: dues[idx].account.last4
        },
        status: 'autopay'
      }
      invoices.push(invoice)
    }
    return invoices
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
