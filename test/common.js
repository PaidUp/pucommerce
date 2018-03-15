let chai = require('chai')
let axios = require('axios')
let chaiHttp = require('chai-http')
let server = require('../server/app').default
let should = chai.should()
let config = require('../server/config/environment').default
let token
var uuid = require('node-uuid')

let request = {
  order: {
    orderForm: {
      planId: '5a859d2103db500098c46dda',
      beneficiaryFirstName: 'John',
      beneficiaryLastName: 'Doe',
      paymentMethodtype: 'card',
      externalPaymentMethodId: 'card_1C5gyzEq5JnVWNpRgXkv0r8I', // card fail card_1C5lGWEq5JnVWNpRCPxjOQ25
      brand: 'visa',
      last4: '1111',
      customInfo: [
        {
          label: 'age',
          value: '12',
          displayed: true
        }
      ]
    }
  },
  preorder: {
    preorderForm: {
      organizationId: 'org_zzzzzzzz',
      organizationName: 'Org Test',
      productId: 'pro_zzzzzzzzzz',
      productName: 'Prod Test',
      productImage: 'http://.....',
      beneficiaryKey: 'org_zzzzzzzz_jhon_doe',
      beneficiaryFirstName: 'Jhon',
      beneficiaryLastName: 'Doe',
      planId: 'plan_zzzzzzzz',
      planDescription: 'Monthly',
      assigneeEmail: 'test@test.com',
      customInfo: [{
        model: 'mod',
        value: 'val'
      }]
    }
  }
}

let results = {}

axios.post('https://devapi.getpaidup.com/api/v1/user/login/email', {
      email: 'test@getpaidup.com',
      password: 'test123',
      rememberMe: false
    })
    .then(function (response) {
      token = 'Bearer ' + response.data.token
    })
    .catch(function (error) {
      console.log(error);
    });

chai.use(chaiHttp)

exports.chai = chai
exports.server = server
exports.should = should
exports.token = function () { return token }
exports.results = results
exports.request = request
