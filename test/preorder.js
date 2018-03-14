process.env.NODE_ENV = 'test'

let common = require('./common')
let server = common.server
let token = common.token
let chai = common.chai
let preorder = common.request.preorder.preorderForm

it('POST# / save a preorder', done => {
  chai
    .request(server)
    .post('/api/v1/commerce/preorder')
    .set('authorization', token())
    .send(preorder)
    .end((err, res) => {
      res.should.have.status(200)
      res.body._id.should.be.a('string')
      res.body.organizationName.should.equal('Org Test')
      done()
    })
})

it('POST# / expect validate fields', done => {
  chai
    .request(server)
    .post('/api/v1/commerce/preorder')
    .set('authorization', token())
    .send({})
    .end((err, res) => {
      res.should.have.status(422)
      done()
    })
})

it('POST# /import save many preorders', done => {
  chai
    .request(server)
    .post('/api/v1/commerce/preorder/import')
    .set('authorization', token())
    .send([preorder, preorder, preorder, preorder, preorder])
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.to.be.an('array')
      res.body.length.should.equal(5)
      done()
    })
})

it('POST# /import expect validate fields', done => {
  chai
    .request(server)
    .post('/api/v1/commerce/preorder/import')
    .set('authorization', token())
    .send([preorder, preorder, {}, preorder, preorder])
    .end((err, res) => {
      res.should.have.status(422)
      done()
    })
})
