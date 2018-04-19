import { OrderModel } from '@/models'
import CommonService from './common.service'
import axios from 'axios'
import { Sequence } from 'pu-common'
import Calculations from './calculations'
import invoiceService from './invoice.service'
import config from '@/config/environment'

let apiOrganization = axios.create({
  baseURL: config.api.organization.url,
  timeout: 10000,
  headers: {'x-api-key': config.auth.key}
})

let orderService

function getPlanData (planId) {
  return new Promise((resolve, reject) => {
    apiOrganization.get(`/plan/${planId}/join`)
      .then(response => {
        resolve(response.data)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
  })
}

function getOrganization (organizationId) {
  return new Promise((resolve, reject) => {
    apiOrganization.get(`/${organizationId}`)
      .then(response => {
        resolve(response.data)
      }).catch(error => {
        console.log(error)
        reject(error)
      })
  })
}

function bulkBeneficiary (beneficiaries) {
  return new Promise((resolve, reject) => {
    apiOrganization.post(`/beneficiary/import`, beneficiaries)
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        console.log(error)
        reject(error)
      })
  })
}

function prepareOrder ({ planId, beneficiaryFirstName, beneficiaryLastName, customInfo } = {}) {
  return new Promise((resolve, reject) => {
    Promise.all([
      getPlanData(planId),
      Sequence.next('order')
    ]).then(values => {
      let { organization, product, plan } = values[0]
      let orderId = values[1].ids[0]
      let beneficiary = {
        organizationId: organization._id,
        organizationName: organization.businessName,
        firstName: beneficiaryFirstName,
        lastName: beneficiaryLastName
      }
      bulkBeneficiary([beneficiary]).then(res => {
        let payload = buildOrder(orderId, organization, product, plan, beneficiary, customInfo)
        resolve({
          payload,
          organization,
          product,
          plan,
          beneficiary
        })
      }).catch(reason => reject(reason))
    }).catch(reason => reject(reason))
  })
}

function buildOrder (orderId, organization, product, plan, beneficiary, customInfo) {
  return {
    orderId,
    organizationId: organization._id,
    organizationName: organization.businessName,
    productId: product._id,
    productName: product.name,
    productImage: product.image,
    season: product.season,
    beneficiaryFirstName: beneficiary.firstName,
    beneficiaryLastName: beneficiary.lastName,
    customInfo: customInfo,
    status: 'active'
  }
}

function buildInvoices (orderId, organization, product, plan, beneficiary, params) {
  let { user, paymentMethodtype, externalPaymentMethodId, brand, last4 } = params
  let res = []
  return new Promise((resolve, reject) => {
    Sequence.next('invoice', plan.dues.length).then(seqs => {
      for (let index = 0; index < plan.dues.length; index++) {
        const due = plan.dues[index]
        let calculation = calc(paymentMethodtype, product, due)
        res.push({
          invoiceId: seqs.ids[index],
          orderId,
          label: due.description,
          connectAccount: organization.connectAccount,
          dataCharge: due.dateCharge,
          price: due.amount,
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
            paymentMethodtype,
            externalPaymentMethodId,
            brand,
            last4
          }
        })
      }
      resolve(res)
    })
  })
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
  return getOrganization(order.organizationId).then(org => {
    organization = org
    return Sequence.next('invoice', dues.length)
  }).then(seqs => {
    for (let idx = 0; idx < dues.length; idx++) {
      let calculation = calc(dues[idx].account.object, product, dues[idx])
      let invoice = {
        invoiceId: seqs.ids[idx],
        orderId: order._id,
        label: dues[idx].description,
        connectAccount: organization.connectAccount,
        dataCharge: dues[idx].dateCharge,
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

class OrderService extends CommonService {
  constructor () {
    super(new OrderModel())
  }

  save (entity) {
    this.model.save(entity)
  }

  checkout ({order, dues, product, user}) {
    return new Promise((resolve, reject) => {
      Sequence.next('order').then(seq => {
        order.orderId = seq.ids[0]
        this.model.save(order).then(ord => {
          generateInvoices(ord, dues, product, user).then(invoices => {
            invoiceService.insertMany(invoices).then(result => {
              ord.invoices = result
              resolve(ord)
            })
          }).catch(reason => {
            console.log(reason)
            reject(reason)
          })
        })
      })
    })
  }

  generate (params) {
    return new Promise((resolve, reject) => {
      prepareOrder(params).then(preOrder => {
        let { payload, organization, product, plan, beneficiary } = preOrder
        this.model.save(payload).then(order => {
          buildInvoices(order._id, organization, product, plan, beneficiary, params).then(invoices => {
            invoiceService.insertMany(invoices).then(result => resolve(result))
          })
        })
      })
    })
  }

  aggregateByBeneficiary ({ organizationId, beneficiaryFirstName, beneficiaryLastName, userEmail }) {
    return new Promise((resolve, reject) => {
      try {
        this.model.collection.aggregate([
          { $match: { organizationId, beneficiaryFirstName, beneficiaryLastName } },
          { $lookup: {
            from: 'pu_commerce_invoices',
            localField: '_id',
            foreignField: 'orderId',
            as: 'invoices'}
          },
          { $match: { 'invoices.user.userEmail': userEmail } }
        ]).exec((err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  aggregateCreditByBeneficiary ({ organizationId, beneficiaryFirstName, beneficiaryLastName }) {
    return new Promise((resolve, reject) => {
      try {
        this.model.collection.aggregate([
          { $match: { organizationId, beneficiaryFirstName, beneficiaryLastName } },
          { $lookup: {
            from: 'pu_commerce_credits',
            localField: '_id',
            foreignField: 'orderId',
            as: 'credits'}
          }
        ]).exec((err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

orderService = new OrderService()

export default orderService
