process.env.NODE_ENV = 'test'

let common = require('./common')
let server = common.server
let token = common.token
let chai = common.chai

function importTest(name, path) {
  describe(name, function () {
      require(path);
  });
}

describe('loading express', function () {
  before(function (done) {
    setTimeout(() => {
      done()
    }, 4000)
  })

  after(function () {
    server.close()
  })

  describe('/GET root', () => {
    it('it should GET status 200', done => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200)
          done()
        })
    })
  })

  importTest('order: /api/v1/commerce/order ', './order');
  importTest('invoice: /api/v1/commerce/invoice ', './invoice');
  importTest('preorder: /api/v1/commerce/preorder ', './preorder');
  importTest('contract: ', './contract');
})
