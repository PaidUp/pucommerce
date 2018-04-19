process.env.NODE_ENV = 'test'

let common = require('./common')
let server = common.server
let token = common.token
let chai = common.chai

it('POST# / create an order', done => {
  chai
    .request(server)
    .post('/api/v1/commerce/order')
    .set('authorization', token())
    .send(common.request.order.orderForm)
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.to.be.an('array')
      res.body[0].should.have.property('_id')
      res.body[0].should.have.property('invoiceId')
      res.body[0].should.have.property('orderId')
      common.results.invoices = res.body
      done()
    })
})

it('GET# /beneficiary retrieve orders', done => {
  chai
    .request(server)
    .get(`/api/v1/commerce/order/beneficiary?organizationId=5a85cfd53ae52527453f9fa2&beneficiaryFirstName=John&beneficiaryLastName=Doe&userEmail=test@getpaidup.com`)
    .set('authorization', token())
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.to.be.an('array')
      // res.body[0].should.have.property('_id')
      // res.body[0].should.have.property('invoiceId')
      // res.body[0].should.have.property('orderId')
      common.results.orders = res.body
      done()
    })
})

