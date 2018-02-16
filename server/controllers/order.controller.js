import { OrderService } from '@/services'
import { HandlerResponse } from '@/util'
const orderService = new OrderService()

export default class OrganizationCotroller {
  static save (req, res) {
    let hr = new HandlerResponse(res)
    orderService.save(req.body)
      .then(order => {
        return hr.send(order)
      }).catch(reason => {
        return hr.error(reason)
      })
  }

  static generate (req, res) {
    let hr = new HandlerResponse(res)
    if (!res.body.planId) {
      hr.error('planId is required', 422)
    }
    if (!res.body.beneficiaryId) {
      hr.error('beneficiaryId is required', 422)
    }
    if (!res.body.type) {
      hr.error('type is required', 422)
    }
    if (res.body.type !== 'bank' && res.type !== 'card') {
      hr.error('type must be card or bank', 422)
    }
    if (!res.body.externalPaymentMethodId) {
      hr.error('externalPaymentMethodId is required', 422)
    }
    if (!res.body.brand) {
      hr.error('brand is required', 422)
    }
    if (!res.body.last4) {
      hr.error('last4 is required', 422)
    }
    if (!res.user) {
      hr.error('user is required', 401)
    }
    if (res.body.customInfo) {
      if (!Array.isArray(res.body.customInfo)) {
        hr.error('customInfo must be an array', 422)
      }
      for (let ci of res.body.customInfo) {
        if (!ci.label) {
          hr.error('customInfo.label is required', 422)
        }
        if (!ci.value) {
          hr.error('customInfo.value is required', 422)
        }
      }
    }
    req.body.user = req.user
    orderService.generate(req.body)
      .then(order => {
        return hr.send(order)
      }).catch(reason => {
        return hr.error(reason)
      })
  }
}
