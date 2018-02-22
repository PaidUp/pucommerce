import { InvoiceModel } from '@/models'
import CommonService from './common.service'

let invoiceService

class InvoiceService extends CommonService {
  constructor () {
    super(new InvoiceModel())
  }

  insertMany (arr) {
    return this.model.insertMany(arr).then(docs => docs)
  }
}

invoiceService = new InvoiceService()

export default invoiceService
