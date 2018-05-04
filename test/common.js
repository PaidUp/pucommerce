let chai = require('chai')
let axios = require('axios')
let chaiHttp = require('chai-http')
let server = require('../server/app').default
let should = chai.should()
let config = require('../server/config/environment').default
let token
let uuid = require('node-uuid')

let request = {
  checkout: {
    order: {
      organizationId: '5ab172323ae5252745ae2af8',
      organizationName: 'Isotopes Volleyball Club',
      productId: '5ad0d223f784e743e4ea91dc',
      productName: '16U Elite',
      productImage: '',
      season: 'test',
      beneficiaryId: '5ade82ebd9903c3bdc3e833e',
      beneficiaryFirstName: 'daf',
      beneficiaryLastName: 'asdf'
    },
    dues: [
      {
        description: 'Deposit 1',
        dateCharge: '2019-01-01T16:00:00.000Z',
        maxDateCharge: '2019-01-15T16:00:00.000Z',
        amount: 2350,
        _id: '5ad523c788203318e3af970a',
        account: {
          id: 'card_1CNVK1Eq5JnVWNpRvpUzuiiS',
          object: 'card',
          address_city: 'test',
          address_country: 'US',
          address_line1: 'test',
          address_line1_check: 'pass',
          address_line2: null,
          address_state: 'AK',
          address_zip: '11111',
          address_zip_check: 'pass',
          brand: 'Visa',
          country: 'US',
          customer: 'cus_ClAeMSIwkWzPsL',
          cvc_check: 'pass',
          dynamic_last4: null,
          exp_month: 11,
          exp_year: 2021,
          fingerprint: 'pfZ3qwdQIhVHkFDP',
          funding: 'unknown',
          last4: '1111',
          metadata: {},
          name: 'test',
          tokenization_method: null
        }
      }
    ],
    product: {
      createOn: '2018-04-13T15:52:03.990Z',
      updateOn: '2018-04-13T15:52:03.990Z',
      _id: '5ad0d223f784e743e4ea91dc',
      organizationId: '5ab172323ae5252745ae2af8',
      season: 'test',
      sku: '16U_Elite',
      name: '16U Elite',
      description: '16U Elite',
      statementDescriptor: 'Isotopes_16UElite',
      image: '',
      processingFees: {
        cardFee: 0.3,
        cardFeeFlat: 2.9,
        achFee: 0,
        achFeeFlat: 0.25,
        achFeeCap: 0.25
      },
      collectionFees: { fee: 3.73, feeFlat: 0 },
      payFees: { processing: true, collect: true },
      status: 'active'
    }
  },
  preorder: {
    preorderForm: {
      organizationId: 'org_zzzzzzzz',
      organizationName: 'Org Test',
      productId: 'pro_zzzzzzzzzz',
      productName: 'Prod Test',
      productImage: 'http://.....',
      beneficiaryId: 'org_zzzzzzzz_jhon_doe',
      beneficiaryFirstName: 'Jhon',
      beneficiaryLastName: 'Doe',
      planId: 'plan_zzzzzzzz',
      planDescription: 'Monthly',
      assigneeEmail: 'test@test.com',
      customInfo: [
        {
          model: 'mod',
          value: 'val'
        }
      ]
    }
  },
  contract: {
    signature:
      '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'
  },
  credit: {
    form: {
      label: 'Dues Commintment Due Fee',
      description: 'test credit memo',
      price: 200,
      beneficiaryId: 'xxxx',
      organizationId: 'xxxx',
      productId: 'xxxx',
      status: 'partially_refunded'
    }
  }
}

let results = {}

axios
  .post('https://devapi.getpaidup.com/api/v1/user/login/email', {
    email: 'test@getpaidup.com',
    password: 'test123',
    rememberMe: false
  })
  .then(function (response) {
    token = 'Bearer ' + response.data.token
  })
  .catch(function (error) {
    console.log(error)
  })

chai.use(chaiHttp)

exports.chai = chai
exports.server = server
exports.should = should
exports.token = function () {
  return token
}
exports.results = results
exports.request = request
