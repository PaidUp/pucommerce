import { creditService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class OrganizationCotroller {
  static addCreditMeno (req, res) {
    let { label, price, dateCharge, status } = req.body
    if (!label) return HR.error(res, 'label is required', 422)
    if (!price) return HR.error(res, 'price is required', 422)
    if (!dateCharge) return HR.error(res, 'dateCharge is required', 422)
    if (!status) return HR.error(res, 'status is required', 422)

    creditService.add(req.body)
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }

  static getByBeneficiary (req, res) {
    creditService.find({ beneficiaryId: req.params.beneficiaryId })
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }

  static getByOrganization (req, res) {
    const organizationId = req.params.organizationId
    const season = req.query.seasonId
    if (!organizationId) return HR.error(res, 'organizationId is required', 422)
    if (!season) return HR.error(res, 'season is required', 422)
    creditService.find({ organizationId, season })
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }

  static checkout (req, res) {
    let { order, credits } = req.body
    if (!order) return HR.error(res, 'order is required', 422)
    if (!credits) return HR.error(res, 'credits is required', 422)
    creditService.checkout(order, credits)
      .then(values => {
        HR.send(res, values)
      })
      .catch(reason => {
        HR.error(res, reason)
      })
  }
}
