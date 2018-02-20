import { InvoiceModel } from '@/models'
import CommonService from './common.service'

let invoiceService

export default class InvoiceService extends CommonService {
  constructor () {
    super(new InvoiceModel())
  }
  static getInstance () {
    if (!invoiceService) {
      invoiceService = new InvoiceService()
    }
    return invoiceService
  }

  insertMany (arr) {
    return this.model.insertMany(arr).then(docs => docs)
  }
}
