import { creditService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class OrganizationCotroller {
  static addCreditMeno (req, res) {
    console.log('req.body: ', req.body)
    let { label, description, price, beneficiaryId, assigneeEmail, productId, productName, organizationId, season, status, dateCharge } = req.body
    if (!label) return HR.error(res, 'label is required', 422)
    if (!description) return HR.error(res, 'description is required', 422)
    if (!price) return HR.error(res, 'price is required', 422)
    if (!beneficiaryId) return HR.error(res, 'beneficiaryId is required', 422)
    if (!assigneeEmail) return HR.error(res, 'assigneeEmail is required', 422)
    if (!productId) return HR.error(res, 'productId is required', 422)
    if (!productName) return HR.error(res, 'productName is required', 422)
    if (!organizationId) return HR.error(res, 'organizationId is required', 422)
    if (!season) return HR.error(res, 'season is required', 422)
    if (!status) return HR.error(res, 'status is required', 422)
    if (!dateCharge) return HR.error(res, 'dateCharge is required', 422)
    req.body.createOn = new Date(dateCharge)

    creditService.add(req.body)
      .then(cMemo => HR.send(res, cMemo))
      .catch(reason => HR.error(res, reason))
  }

  static update (req, res) {
    let { id, values } = req.body
    console.log('req.body: ', req.body)
    if (!id) return HR.error(res, 'id is required', 422)
    if (!values.label) return HR.error(res, 'label is required', 422)
    if (!values.price) return HR.error(res, 'price is required', 422)
    if (!values.assigneeEmail) return HR.error(res, 'assigneeEmail is required', 422)
    if (!values.status) return HR.error(res, 'status is required', 422)
    if (!values.dateCharge) return HR.error(res, 'dateCharge is required', 422)
    values.createOn = new Date(values.dateCharge)
    creditService.updateById(id, values)
      .then(data => HR.send(res, data))
      .catch(reason => HR.error(res, reason))
  }

  static delete (req, res) {
    if (!req.params.id) return HR.error(res, 'id is required', 422)
    creditService.model.removeById(req.params.id)
      .then(data => HR.send(res, data))
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
