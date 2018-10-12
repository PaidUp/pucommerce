import { invoiceService, creditService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class CheckoutCotroller {
  static apply (req, res) {
    let { order, dues, credits, product, user = req.user } = req.body
    if (!order) return HR.error(res, 'order is required', 422)
    if (!dues) return HR.error(res, 'dues is required', 422)
    if (!product) return HR.error(res, 'product is required', 422)
    // if (!credits) return HR.error(res, 'credits is required', 422)
    let invoices
    invoiceService.checkout({order, dues, product, user})
      .then(invs => {
        invoices = invs
        return creditService.checkout(order, credits, user)
      })
      .then(credits => {
        HR.send(res, {invoices, credits})
      })
      .catch(reason => {
        HR.error(res, reason)
      })
  }
}
