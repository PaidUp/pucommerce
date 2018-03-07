process.env.NODE_ENV = 'test'

let common = require('./common')
let server = common.server
let token = common.token
let chai = common.chai

it('POST# /note add a note to invoice', done => {
  let invoice = common.results.invoices[0]
  chai
    .request(server)
    .post('/api/v1/commerce/invoice/note')
    .set('authorization', token)
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
