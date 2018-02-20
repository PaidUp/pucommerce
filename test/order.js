process.env.NODE_ENV = 'test'

let common = require('./common')
let server = common.server
let token = common.token
let chai = common.chai
let organizationResults = common.results.organization

it('POST# / create an order', done => {
  chai
    .request(server)
    .post('/api/v1/commerce/order')
    .set('authorization', token)
    .send(common.request.order.orderForm)
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.to.be.an('array')
      res.body[0].should.have.property('_id')
      res.body[0].should.have.property('invoiceId')
      res.body[0].should.have.property('orderId')
      done()
    })
})

