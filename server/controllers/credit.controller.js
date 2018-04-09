import { creditService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class OrganizationCotroller {
  static addCreditMeno (req, res) {
    let { label, amount, orderId, status } = req.body
    if (!label) return HR.error(res, 'label is required', 422)
    if (!amount) return HR.error(res, 'amount is required', 422)
    if (!orderId) return HR.error(res, 'orderId is required', 422)
    if (!status) return HR.error(res, 'status is required', 422)

    creditService.add(req.body)
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }
}
