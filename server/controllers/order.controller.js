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
}
