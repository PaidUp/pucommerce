import { invoiceService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class OrganizationCotroller {
  static addNote (req, res) {
    let { id, note } = req.body
    if (!id) return HR.error(res, 'id is required', 422)
    if (!note) return HR.error(res, 'note is required', 422)

    invoiceService.addNote(req.body)
      .then(order => HR.send(res, order))
      .catch(reason => HR.error(res, reason))
  }

  static getByPaymentMethod (req, res) {
    const source = req.params.source
    if (!source) return HR.error(res, 'source is required', 422)
    invoiceService.find({'paymentDetails.externalPaymentMethodId': source})
      .then(results => HR.send(res, results))
      .catch(reason => HR.error(res, reason))
  }
}
