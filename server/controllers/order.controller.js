import { OrderService } from '@/services'
import { HandlerResponse } from 'pu-common'
const orderService = new OrderService()

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
    if (!res.body.planId) {
      HandlerResponse.error(res, 'planId is required', 422)
    }
    if (!res.body.beneficiaryId) {
      HandlerResponse.error(res, 'beneficiaryId is required', 422)
    }
    if (!res.body.type) {
      HandlerResponse.error(res, 'type is required', 422)
    }
    if (res.body.type !== 'bank' && res.type !== 'card') {
      HandlerResponse.error(res, 'type must be card or bank', 422)
    }
    if (!res.body.externalPaymentMethodId) {
      HandlerResponse.error(res, 'externalPaymentMethodId is required', 422)
    }
    if (!res.body.brand) {
      HandlerResponse.error(res, 'brand is required', 422)
    }
    if (!res.body.last4) {
      HandlerResponse.error(res, 'last4 is required', 422)
    }
    if (!res.user) {
      HandlerResponse.error(res, 'user is required', 401)
    }
    if (res.body.customInfo) {
      if (!Array.isArray(res.body.customInfo)) {
        HandlerResponse.error(res, 'customInfo must be an array', 422)
      }
      for (let ci of res.body.customInfo) {
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
