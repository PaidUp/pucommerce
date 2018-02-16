import { InvoiceModel } from '@/models'
import CommonService from './common.service'

const invoiceModel = new InvoiceModel()

export default class UserService extends CommonService {
  constructor () {
    super(invoiceModel)
  }
}
