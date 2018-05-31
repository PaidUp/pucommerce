import { invoiceService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'
import Stripe from 'stripe'
import config from '@/config/environment'
const stripe = Stripe(config.stripe.key)

export default class OrganizationCotroller {
  static checkout (req, res) {
    let { order, dues, product, user = req.user } = req.body
    if (!order) return HR.error(res, 'order is required', 422)
    if (!dues) return HR.error(res, 'dues is required', 422)
    if (!product) return HR.error(res, 'product is required', 422)
    invoiceService.checkout({order, dues, product, user})
      .then(order => HR.send(res, order))
      .catch(reason => {
        HR.error(res, reason)
      })
  }

  static webhook (req, res) {
    const signature = req.headers['stripe-signature']
    let event = stripe.webhooks.constructEvent(req.rawBody, signature, config.stripe.webhook)
    console.log('event: ', event)
    if (event && event.object && event.object.source && event.object.metadata._invoice && event.object.source.object === 'bank_account') {
      let id = event.object.metadata._invoice
      let status = event.object.status === 'succeeded' ? 'paidup' : event.object.status
      let values = { status }
      if (req.body.type === 'charge.failed') {
        values['$push'] = {
          attempts: {
            code: event.object.failure_code,
            message: event.object.failure_message
          }
        }
      }
      invoiceService.webhook({ id, values }).then(resp => {
        HR.send(res, {msg: 'charged'})
      }).catch(reason => {
        HR.error(res, reason)
      })
    } else {
      HR.send(res, {msg: 'no bank account'})
    }
  }

  static update (req, res) {
    let { id, values } = req.body
    if (!id) return HR.error(res, 'id is required', 422)
    if (!values) return HR.error(res, 'values is required', 422)
    invoiceService.updateById(id, values)
      .then(invoice => {
        return HR.send(res, invoice)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static addNote (req, res) {
    let { id, note } = req.body
    if (!id) return HR.error(res, 'id is required', 422)
    if (!note) return HR.error(res, 'note is required', 422)

    invoiceService.addNote(req.body)
      .then(order => HR.send(res, order))
      .catch(reason => HR.error(res, reason))
  }

  static getByPaymentMethod (req, res) {
    const paymentMethodId = req.params.paymentMethodId
    if (!paymentMethodId) return HR.error(res, 'paymentMethodId is required', 422)
    invoiceService.find({'paymentDetails.externalPaymentMethodId': paymentMethodId})
      .then(results => HR.send(res, results))
      .catch(reason => HR.error(res, reason))
  }

  static getInvoicesByBeneficiary (req, res) {
    const beneficiaryId = req.params.beneficiaryId
    invoiceService.find({beneficiaryId})
      .then(results => HR.send(res, results))
      .catch(reason => HR.error(res, reason))
  }
}
