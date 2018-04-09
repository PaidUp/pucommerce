import { contractService } from '../server/services'
import common from './common'
let server = common.server
let chai = common.chai
let token = common.token

it('POST# / add a credit memo', done => {
  let form = common.request.credit.form
  form.orderId = common.results.orders[0]._id
  chai
    .request(server)
    .post('/api/v1/commerce/credit')
    .set('authorization', token())
    .send(form)
    .end((err, res) => {
      res.should.have.status(200)
      res.body._id.should.be.a('string')
      res.body.amount.should.equal(200)
      done()
    })
})