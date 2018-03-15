import { orderService } from '@/services'
import { HandlerResponse } from 'pu-common'

export default class OrganizationCotroller {
  static save (req, res) {
    orderService.save(req.body)
      .then(order => {
        return HandlerResponse.send(res, order)
      }).catch(reason => {
        return HandlerResponse.error(res, reason)
      })
  }

  static generate (req, res) {
    if (!req.body.planId) {
      HandlerResponse.error(res, 'planId is required', 422)
    }
    if (!req.body.beneficiaryFirstName) {
      HandlerResponse.error(res, 'beneficiaryFirstName is required', 422)
    }
    if (!req.body.beneficiaryLastName) {
      HandlerResponse.error(res, 'beneficiaryLastName is required', 422)
    }
    if (!req.body.paymentMethodtype) {
      HandlerResponse.error(res, 'paymentMethodtype is required', 422)
    }
    if (req.body.paymentMethodtype !== 'bank' && req.body.paymentMethodtype !== 'card') {
      HandlerResponse.error(res, 'paymentMethodtype must be card or bank', 422)
    }
    if (!req.body.externalPaymentMethodId) {
      HandlerResponse.error(res, 'externalPaymentMethodId is required', 422)
    }
    if (!req.body.brand) {
      HandlerResponse.error(res, 'brand is required', 422)
    }
    if (!req.body.last4) {
      HandlerResponse.error(res, 'last4 is required', 422)
    }
    if (!req.user) {
      HandlerResponse.error(res, 'user is required', 401)
    }
    if (req.body.customInfo) {
      if (!Array.isArray(req.body.customInfo)) {
        HandlerResponse.error(res, 'customInfo must be an array', 422)
      }
      for (let ci of req.body.customInfo) {
        if (!ci.label) {
          HandlerResponse.error(res, 'customInfo.label is required', 422)
        }
        if (!ci.value) {
          HandlerResponse.error(res, 'customInfo.value is required', 422)
        }
      }
    }
    req.body.user = req.user
    orderService.generate(req.body)
      .then(order => {
        return HandlerResponse.send(res, order)
      }).catch(reason => {
        return HandlerResponse.error(res, reason)
      })
  }
}
