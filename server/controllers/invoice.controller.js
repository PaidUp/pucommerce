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
    if (event.data && event.data.object && event.data.object.source && event.data.object.metadata._invoice && event.data.object.source.object === 'bank_account') {
      let id = event.data.object.metadata._invoice
      let status = event.data.object.status === 'succeeded' ? 'paidup' : event.data.object.status
      let values = { status }
      if (event.type === 'charge.failed') {
        values['$push'] = {
          attempts: {
            code: event.data.object.failure_code,
            message: event.data.object.failure_message
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

  static getById (req, res) {
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

  static updateCalculations (req, res) {
    let { id, values, product } = req.body
    if (!id) return HR.error(res, 'id is required', 422)
    if (!values) return HR.error(res, 'values is required', 422)
    if (!product) return HR.error(res, 'product is required', 422)
    invoiceService.updateInvoice(id, values, product)
      .then(invoice => {
        return HR.send(res, invoice)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static newInvoice (req, res) {
    let { values, product } = req.body
    if (!values) return HR.error(res, 'values is required', 422)
    if (!product) return HR.error(res, 'product is required', 422)
    invoiceService.newInvoice(values, product)
      .then(invoice => {
        return HR.send(res, invoice)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static delete (req, res) {
    if (!req.params.id) return HR.error(res, 'id is required', 422)
    invoiceService.model.removeById(req.params.id)
      .then(data => HR.send(res, data))
      .catch(reason => HR.error(res, reason))
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
    if (!req.params.beneficiaryId) return HR.error(res, 'beneficiaryId is required', 422)
    let params = {
      beneficiaryId: req.params.beneficiaryId
    }
    const assignee = req.query.assegnee
    if (assignee) params['user.userEmail'] = assignee
    invoiceService.find(params)
      .then(results => HR.send(res, results))
      .catch(reason => HR.error(res, reason))
  }

  static getInvoicesByOrganization (req, res) {
    const organizationId = req.params.organizationId
    const seasonId = req.query.seasonId
    if (!organizationId) return HR.error(res, 'organizationId is required', 422)
    if (!seasonId) return HR.error(res, 'season is required', 422)
    const productId = req.query.productId
    const beneficiaryId = req.query.beneficiaryId
    let values = { organizationId, season: seasonId }
    if (productId) values.productId = productId
    if (beneficiaryId) values.beneficiaryId = beneficiaryId
    invoiceService.find(values)
      .then(results => HR.send(res, results))
      .catch(reason => HR.error(res, reason))
  }
}
