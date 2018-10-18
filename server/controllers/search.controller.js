import { invoiceService, creditService, preorderService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class CheckoutCotroller {
  static exec (req, res) {
    if (!req.query.criteria) return HR.error(res, 'Criteria is required', 422)
    const criteria = req.query.criteria
    Promise.all([
      invoiceService.search(criteria),
      creditService.search(criteria),
      preorderService.search(criteria)
    ])
      .then(values => HR.send(res, {
        invoices: values[0],
        credits: values[1],
        preorders: values[2]
      }))
      .catch(reason => HR.error(res, reason))
  }
}
