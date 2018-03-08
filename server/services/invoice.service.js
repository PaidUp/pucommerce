import { InvoiceModel } from '@/models'
import CommonService from './common.service'

let invoiceService

class InvoiceService extends CommonService {
  constructor () {
    super(new InvoiceModel())
  }

  addNote ({ id, note }) {
    return this.model.updateById(id, { $push: { notes: note } })
  }
}

invoiceService = new InvoiceService()

export default invoiceService
