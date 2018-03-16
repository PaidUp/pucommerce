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
    const paymentMethodId = req.params.paymentMethodId
    if (!paymentMethodId) return HR.error(res, 'paymentMethodId is required', 422)
    invoiceService.find({'paymentDetails.externalPaymentMethodId': paymentMethodId})
      .then(results => HR.send(res, results))
      .catch(reason => HR.error(res, reason))
  }
}
