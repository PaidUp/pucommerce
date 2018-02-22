import { InvoiceModel } from '@/models'
import CommonService from './common.service'

let invoiceService

class InvoiceService extends CommonService {
  constructor () {
    super(new InvoiceModel())
  }
  static get instance () {
    if (!invoiceService) {
      invoiceService = new InvoiceService()
    }
    return invoiceService
  }

  insertMany (arr) {
    return this.model.insertMany(arr).then(docs => docs)
  }
}

export default InvoiceService.instance
