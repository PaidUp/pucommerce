import { OrderModel } from '@/models'
import CommonService from './common.service'
import axios from 'axios'
// import Calculations from '@/util'

axios.defaults.headers.common['Authorization'] = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNvbnRhY3RzIjpbXSwicm9sZXMiOlsicGFyZW50Il0sImNyZWF0ZU9uIjoiMjAxOC0wMi0xNVQxODoxNjoyNS43NTBaIiwidXBkYXRlT24iOiIyMDE4LTAyLTE1VDE4OjE2OjI1Ljc1MFoiLCJfaWQiOiI1YTg1Y2U3OTU5MWU4NzIxMThiOTkzOGMiLCJmaXJzdE5hbWUiOiJ0ZXN0IiwibGFzdE5hbWUiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGdldHBhaWR1cC5jb20iLCJ0eXBlIjoiY3VzdG9tZXIiLCJzYWx0IjoiZDhoVmh1UzZMSmgrV2gvMWpqMWYvQT09IiwiaGFzaGVkUGFzc3dvcmQiOiJTVkN5b0RRcVVmWS9McWdIUmFqanU1RGhDTVd3UU9oTlJzSDRNTzhoZjExZ2g3K1QwbmRIbmRnbjV4UDYvOHlKMTVYRmZBanFhKzliTGNWRmRMcDdqdz09IiwiX192IjowfSwiaWF0IjoxNTE4NzE4NjIzLCJleHAiOjM0MTA4Nzg2MjN9.tLvpo_aejNOB4fuIHvYHxdTBkEWxjGT0nspqtX2yzUQ'

const orderModel = new OrderModel()

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

function prepareOrder (params) {
  let { planId, bebeficiaryId } = params
  return new Promise((resolve, reject) => {
    Promise.all([
      getPlanData(planId),
      getBeneficiary(bebeficiaryId)
    ]).then(values => {
      let { organization, product, plan } = values[0]
      let beneficiary = values[1]
      let payload = buildOrder(organization, product, plan, beneficiary, params.customInfo)
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

function buildOrder (organization, product, plan, beneficiary, customInfo) {
  return {
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
  let { user, type, externalPaymentMethodId, brand, last4 } = params
  let res = []
  for (let due of plan.dues) {
    res.push({
      invoiceId: 'xxxx',
      orderId,
      label: due.description,
      connectAccount: organization.connectAccount,
      dataCharge: due.dataCharge,
      price: due.amount,
      priceBase: 0,
      paidupFee: 0,
      user: {
        userId: user._id,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        userEmail: user.email
      },
      payFees: product.payFees,
      paymentDetails: {
        externalAccountId: user.externalAccountId,
        type,
        externalPaymentMethodId,
        brand,
        last4
      },
      status: 'pending'
    })
  }
  return res
}

// function calc (type, product) {
//   let res = {
//     priceBase: 0,
//     paidupFee: 0
//   }
//   let { processingFees, collectionFees, payFees } = product
//   res = calc[type](fees)
//   return res
// }

export default class UserService extends CommonService {
  constructor () {
    super(orderModel)
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
          let invoices = buildInvoices(order._Id, organization, product, plan, beneficiary, params)
          resolve(invoices)
        })
      })
    })
  }
}
