import { orderService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

export default class OrganizationCotroller {
  static save (req, res) {
    orderService.save(req.body)
      .then(order => HR.send(res, order))
      .catch(reason => HR.error(res, reason))
  }

  static generate (req, res) {
    if (!req.body.planId) return HR.error(res, 'planId is required', 422)
    if (!req.body.beneficiaryFirstName) return HR.error(res, 'beneficiaryFirstName is required', 422)
    if (!req.body.beneficiaryLastName) return HR.error(res, 'beneficiaryLastName is required', 422)
    if (!req.body.paymentMethodtype) return HR.error(res, 'paymentMethodtype is required', 422)
    if (req.body.paymentMethodtype !== 'bank' && req.body.paymentMethodtype !== 'card') return HR.error(res, 'paymentMethodtype must be card or bank', 422)
    if (!req.body.externalPaymentMethodId) return HR.error(res, 'externalPaymentMethodId is required', 422)
    if (!req.body.brand) return HR.error(res, 'brand is required', 422)
    if (!req.body.last4) return HR.error(res, 'last4 is required', 422)
    if (!req.user) return HR.error(res, 'user is required', 401)
    if (req.body.customInfo) {
      if (!Array.isArray(req.body.customInfo)) return HR.error(res, 'customInfo must be an array', 422)
      for (let ci of req.body.customInfo) {
        if (!ci.label) return HR.error(res, 'customInfo.label is required', 422)
        if (!ci.value) return HR.error(res, 'customInfo.value is required', 422)
      }
    }
    req.body.user = req.user
    orderService.generate(req.body)
      .then(order => HR.send(res, order))
      .catch(reason => HR.error(res, reason))
  }

  static getOrdersByBeneficiary (req, res) {
    let { organizationId, beneficiaryFirstName, beneficiaryLastName, userEmail } = req.query
    if (!organizationId) return HR.error(res, 'organizationId is required', 422)
    if (!beneficiaryFirstName) return HR.error(res, 'beneficiaryFirstName is required', 422)
    if (!beneficiaryLastName) return HR.error(res, 'beneficiaryLastName is required', 422)
    if (!userEmail) return HR.error(res, 'userEmail is required', 422)
    Promise.all([
      orderService.aggregateByBeneficiary({ organizationId, beneficiaryFirstName, beneficiaryLastName, userEmail }),
      orderService.aggregateCreditByBeneficiary({ organizationId, beneficiaryFirstName, beneficiaryLastName })
    ]).then(values => {
      let orders = values[0].map(order => {
        values[1].forEach(element => {
          if (element._id.toString() === order._id.toString()) {
            order.invoices = order.invoices.concat(element.credits)
          }
        })
        return order
      })
      HR.send(res, orders)
    }).catch(reason => HR.error(res, reason))
  }
}
