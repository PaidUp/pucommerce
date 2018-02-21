import { OrderModel } from '@/models'
import CommonService from './common.service'
import axios from 'axios'
import { Calculations, Sequence } from 'pu-common'
import InvoiceService from './invoice.service'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNvbnRhY3RzIjpbXSwicm9sZXMiOlsicGFyZW50Il0sImNyZWF0ZU9uIjoiMjAxOC0wMi0xNVQxODoxNjoyNS43NTBaIiwidXBkYXRlT24iOiIyMDE4LTAyLTE1VDE4OjE2OjI1Ljc1MFoiLCJfaWQiOiI1YTg1Y2U3OTU5MWU4NzIxMThiOTkzOGMiLCJmaXJzdE5hbWUiOiJ0ZXN0IiwibGFzdE5hbWUiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGdldHBhaWR1cC5jb20iLCJ0eXBlIjoiY3VzdG9tZXIiLCJzYWx0IjoiZDhoVmh1UzZMSmgrV2gvMWpqMWYvQT09IiwiaGFzaGVkUGFzc3dvcmQiOiJTVkN5b0RRcVVmWS9McWdIUmFqanU1RGhDTVd3UU9oTlJzSDRNTzhoZjExZ2g3K1QwbmRIbmRnbjV4UDYvOHlKMTVYRmZBanFhKzliTGNWRmRMcDdqdz09IiwiX192IjowfSwiaWF0IjoxNTE4NzE4NjIzLCJleHAiOjM0MTA4Nzg2MjN9.tLvpo_aejNOB4fuIHvYHxdTBkEWxjGT0nspqtX2yzUQ'

let orderService
const invoiceService = InvoiceService.getInstance()

// https://devapi.getpaidup.com/api/v1/organization/plan/5a859d2103db500098c46dda/join
function getPlanData (planId) {
  return new Promise((resolve, reject) => {
    axios.get('https://devapi.getpaidup.com/api/v1/organization/plan/5a859d2103db500098c46dda/join')
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        console.log(error)
        reject(error)
      })
  })
}

function getBeneficiary (beneficiaryId) {
  return new Promise((resolve, reject) => {
    axios.get('https://devapi.getpaidup.com/api/v1/organization/beneficiary/5a871f393ae525274595abab')
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        console.log(error)
        reject(error)
      })
  })
}

function prepareOrder (params) {
  let { planId, bebeficiaryId } = params
  return new Promise((resolve, reject) => {
    Promise.all([
      getPlanData(planId),
      getBeneficiary(bebeficiaryId),
      Sequence.next('order')
    ]).then(values => {
      let { organization, product, plan } = values[0]
      let beneficiary = values[1]
      let orderId = values[2].ids[0]
      let payload = buildOrder(orderId, organization, product, plan, beneficiary, params.customInfo)
      resolve({
        payload,
        organization,
        product,
        plan,
        beneficiary
      })
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
    beneficiaryId: beneficiary._id,
    beneficiaryName: beneficiary.name,
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
            paymentMethodtype,
            externalPaymentMethodId,
            brand,
            last4
          },
          status: 'pending'
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
  } else if (type === 'bank') {
    res = Calculations.bank(product, due)
  }
  return res
}

export default class OrderService extends CommonService {
  constructor () {
    super(new OrderModel())
  }

  static getInstance () {
    if (!orderService) {
      orderService = new OrderService()
    }
    return orderService
  }

  save (entity) {
    return new Promise((resolve, reject) => {
      this.model.save(entity).then(entity => {
        resolve(entity)
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
}
