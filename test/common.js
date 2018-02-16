let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server/app').default
let should = chai.should()
let config = require('../server/config/environment').default
let token = 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImNvbnRhY3RzIjpbXSwicm9sZXMiOlsicGFyZW50Il0sIl9pZCI6IjVhODMyMTlkMTc1Zjk1MGU3NjlkYmViMyIsImZpcnN0TmFtZSI6InRlc3QiLCJsYXN0TmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJ0eXBlIjoiY3VzdG9tZXIiLCJzYWx0IjoienhvYU1LbjY1TzIwWE1LY0x3aU0yQT09IiwiaGFzaGVkUGFzc3dvcmQiOiJKWWJaNU5wbnJqZTFEaUdMcmhrUm9DTDM4cW5RTVFOKzZRWTJka0pnNy9QMlBVeWZIRkozbllMdlZ5QjhiYXNqb3N2T2pseU9xNlB5WlFIZHU4cVQ5QT09IiwiX192IjowfSwiaWF0IjoxNTE4NTQzMjg3LCJleHAiOjM0MTA3MDMyODd9.pRQNdpZMVh0GRVGyj8Yxh2d_bhwi66hKj49iGChmIuE'
var uuid = require('node-uuid')

let request = {
  order: {
    orderForm: {
      organizationId: 'xxxxxxx',
      organizationName: 'organization test',
      productId: 'yyyyyyyy',
      productName: 'product test',
      productImage: 'https://images....',
      beneficiaryId: 'zzzzzzzz',
      beneficiaryName: 'beneficiary test',
      customInfo: [
        {
          label: 'age',
          value: '12',
          displayed: true
        },
        {
          label: 'food',
          value: 'lasagna',
          displayed: false
        }
      ],
      status: 'active'
    }
  }
}

let results = {}

chai.use(chaiHttp)

exports.chai = chai
exports.server = server
exports.should = should
exports.token = token
exports.results = results
exports.request = request
