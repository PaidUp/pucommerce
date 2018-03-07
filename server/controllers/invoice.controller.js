import { invoiceService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class OrganizationCotroller {
  static addNote (req, res) {
    let { id, note } = req.body
    if (!id) {
      HR.error(res, 'id is required', 422)
    }
    if (!note) {
      HR.error(res, 'note is required', 422)
    }
    invoiceService.addNote(req.body)
      .then(order => {
        return HR.send(res, order)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }
}
