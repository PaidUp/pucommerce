import { PreorderModel } from '@/models'
import CommonService from './common.service'

let preorderService

class PreorderService extends CommonService {
  constructor () {
    super(new PreorderModel())
  }
}

preorderService = new PreorderService()

export default preorderService
