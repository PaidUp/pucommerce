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
    if (!req.params.beneficiaryId) return HR.error(res, 'beneficiaryId is required', 422)
    let params = {
      beneficiaryId: req.params.beneficiaryId
    }
    const assignee = req.query.assegnee
    if (assignee) params['assigneeEmail'] = assignee
    creditService.find(params)
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }

  static getByOrganization (req, res) {
    const organizationId = req.params.organizationId
    const season = req.query.seasonId
    if (!organizationId) return HR.error(res, 'organizationId is required', 422)
    if (!season) return HR.error(res, 'season is required', 422)
    const productId = req.query.productId
    const beneficiaryId = req.query.beneficiaryId
    let values = { organizationId, season }
    if (productId) values.productId = productId
    if (beneficiaryId) values.beneficiaryId = beneficiaryId
    creditService.find(values)
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }

  static checkout (req, res) {
    let { order, credits, user = req.user } = req.body
    if (!order) return HR.error(res, 'order is required', 422)
    if (!credits) return HR.error(res, 'credits is required', 422)
    creditService.checkout(order, credits, user)
      .then(values => {
        HR.send(res, values)
      })
      .catch(reason => {
        HR.error(res, reason)
      })
  }
}
