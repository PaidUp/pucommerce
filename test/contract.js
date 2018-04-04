import { contractService } from '../server/services'
import common from './common'
import { expect } from 'chai'

it.skip('fill a template contract', done => {
  contractService.fillForm({ templateId: 'tpl_gHkeTz6rXh3xfmkA', playerName: 'Juan Lara', signature: common.request.contract.signature }).then(resp => {
    resp.data.should.have.property('submission')
    resp.data.submission.should.have.property('id')
    common.results.contract = resp.data.submission.id
    setTimeout(() => {
      done()
    }, 5000);
    
  }).catch(reason => done(reason))
})

it.skip('get url contract', done => {
  contractService.urlContract(common.results.contract).then(resp => {
    resp.data.should.have.property('id')
    resp.data.should.have.property('state')
    resp.data.state.should.equal('processed')
    done()
  }).catch(reason => done(reason))
})