process.env.NODE_ENV = 'test'

let common = require('./common')
let server = common.server
let token = common.token
let chai = common.chai

it('POST# /checkout create invoices', done => {
  let params = common.request.checkout
  chai
    .request(server)
    .post('/api/v1/commerce/checkout')
    .set('authorization', token())
    .send(params)
    .end((err, res) => {
      res.should.have.status(200)
      common.results.invoices = res.body
      done()
    })
})

it.skip('POST# /note add a note to invoice', done => {
  let invoice = common.results.invoices[0]
  chai
    .request(server)
    .post('/api/v1/commerce/invoice/note')
    .set('authorization', token())
    .send({
      id: invoice._id,
      note: 'this is a note test'
    })
    .end((err, res) => {
      res.should.have.status(200)
      res.body.notes[0].should.be.a('string')
      res.body.notes[0].should.equal('this is a note test')
      done()
    })
})

it('GET# /method/:paymentMethodId get invoices by payent method', done => {
  chai
    .request(server)
    .get('/api/v1/commerce/invoice/method/card_1C5lGWEq5JnVWNpRCPxjOQ21')
    .set('authorization', token())
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.be.a('array')
      done()
    })
})
