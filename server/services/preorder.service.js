import { PreorderModel } from '@/models'
import CommonService from './common.service'
import { Logger } from 'pu-common'
import ZendeskService from './zendesk.service'

let preorderService

class PreorderService extends CommonService {
  constructor () {
    super(new PreorderModel())
  }

  inactive (id, message) {
    return this.model.updateById(id, { status: 'inactive' }).then(preorder => {
      Logger.info('Preorder updated: ' + id)
      const query = (`type:ticket fieldvalue:${id}`)
      ZendeskService.search(query).then(tickets => {
        if (tickets && tickets.length) {
          let ticket = tickets[0]
          let tags = ticket.tags.filter(tag => {
            return tag !== 'signupautomation'
          })
          tags.push('ordercreated')
          ZendeskService.ticketsUpdate(ticket.id, {
            ticket: {
              status: 'open',
              comment: {body: message, public: false},
              tags
            }
          }).then(() => {
            Logger.info('Ticket updated: ' + ticket.id)
          }).catch(reason => {
            Logger.critical('ZendeskService.ticketsUpdate id: ' + ticket.id + ' - ' + reason.result.toString('utf8'))
          })
        }
      }).catch(reason => {
        Logger.critical('ZendeskService.search query: ' + query + ' - ' + reason.result.toString('utf8'))
      })
    })
  }

  search (criteria) {
    return this.model.find({
      $or: [
        {assigneeEmail: new RegExp('^' + criteria + '$', 'i')}
      ]
    })
  }
}

preorderService = new PreorderService()

export default preorderService
