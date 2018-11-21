import { InvoiceModel } from '@/models'
import CommonService from './common.service'
import Calculations from './calculations'
import axios from 'axios'
import moment from 'moment'
import numeral from 'numeral'
import { Sequence, Email, Logger } from 'pu-common'
import config from '@/config/environment'
import { productPriceV2 } from 'machinepack-calculations'
import preorderService from './preorder.service'
import ZendeskService from './zendesk.service'
import randomstring from 'randomstring'

const email = new Email(config.email.options)

let invoiceService
let apiOrganization = axios.create({
  baseURL: config.api.organization.url,
  timeout: 10000,
  headers: {'x-api-key': config.auth.key}
})

let apiUser = axios.create({
  baseURL: config.api.user.url,
  timeout: 10000,
  headers: {'x-api-key': config.auth.key}
})

function capitalize (value) {
  return value.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

function getOrganization (organizationId) {
  return apiOrganization.get(`/${organizationId}`)
}

function buildUnbundleInvoce (product, due, order, organization, user, seq) {
  let calculation = Calculations.exec(product, due.account.object, due.baseAmount)
  let invoice = {
    invoiceId: 'INV' + seq.toUpperCase(),
    label: due.description,
    organizationId: order.organizationId,
    organizationName: order.organizationName,
    productId: order.productId,
    productName: order.productName,
    productImage: order.productImage,
    unbundle: true,
    beneficiaryId: order.beneficiaryId,
    beneficiaryFirstName: order.beneficiaryFirstName,
    beneficiaryLastName: order.beneficiaryLastName,
    season: order.season,
    connectAccount: organization.connectAccount,
    dateCharge: due.dateCharge,
    maxDateCharge: due.maxDateCharge,
    priceBase: due.baseAmount,
    price: calculation.price,
    paidupFee: calculation.paidupFee,
    stripeFee: calculation.processingFee,
    totalFee: calculation.totalFee,
    user: {
      userId: user._id,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      userEmail: user.email
    },
    payFees: product.payFees,
    processingFees: product.processingFees,
    paymentDetails: {
      externalCustomerId: user.externalCustomerId,
      statementDescriptor: product.statementDescriptor,
      paymentMethodtype: due.account.object,
      externalPaymentMethodId: due.account.id,
      brand: due.account.brand || due.account.bank_name,
      last4: due.account.last4
    },
    collectionFees: product.collectionFees,
    tags: due.tags,
    status: 'autopay'
  }
  return invoice
}

function calculations (product, due, order, organization, user, seq) {
  if (product.unbundle) {
    return buildUnbundleInvoce(product, due, order, organization, user, seq)
  }
  return new Promise((resolve, reject) => {
    productPriceV2({
      type: due.account.object,
      capAmount: product.processingFees.achFeeCap,
      originalPrice: due.amount,
      stripePercent: product.processingFees.cardFee,
      stripeFlat: product.processingFees.cardFeeFlat,
      stripeAchPercent: product.processingFees.achFee,
      stripeAchFlat: product.processingFees.achFeeFlat,
      paidUpFee: product.collectionFees.fee,
      paidUpFlat: product.collectionFees.feeFlat,
      discount: 0,
      payProcessing: product.payFees.processing,
      payCollecting: product.payFees.collect
    }).exec(
      {
        error: function (err) {
          reject(err)
        },
        success: function (result) {
          let invoice = {
            invoiceId: 'INV' + seq.toUpperCase(),
            label: due.description,
            organizationId: order.organizationId,
            organizationName: order.organizationName,
            productId: order.productId,
            productName: order.productName,
            productImage: order.productImage,
            unbundle: false,
            beneficiaryId: order.beneficiaryId,
            beneficiaryFirstName: order.beneficiaryFirstName,
            beneficiaryLastName: order.beneficiaryLastName,
            season: order.season,
            connectAccount: organization.connectAccount,
            dateCharge: due.dateCharge,
            maxDateCharge: due.maxDateCharge,
            price: due.amount,
            priceBase: result.basePrice,
            paidupFee: result.feePaidUp,
            stripeFee: result.feeStripe,
            totalFee: result.totalFee,
            user: {
              userId: user._id,
              userFirstName: user.firstName,
              userLastName: user.lastName,
              userEmail: user.email
            },
            payFees: product.payFees,
            processingFees: product.processingFees,
            paymentDetails: {
              externalCustomerId: user.externalCustomerId,
              statementDescriptor: product.statementDescriptor,
              paymentMethodtype: due.account.object,
              externalPaymentMethodId: due.account.id,
              brand: due.account.brand || due.account.bank_name,
              last4: due.account.last4
            },
            tags: due.tags,
            status: 'autopay'
          }
          resolve(invoice)
        }
      }
    )
  })
}

function generateInvoices (order, dues, product, user) {
  let calcPromises = []
  let organization
  return new Promise((resolve, reject) => {
    getOrganization(order.organizationId).then(response => {
      organization = response.data
      return Sequence.next('invoice', dues.length)
    }).then(seqs => {
      for (let idx = 0; idx < dues.length; idx++) {
        let due = dues[idx]
        let dateCharge = new Date(due.dateCharge)
        dateCharge.setUTCHours(16)
        due.dateCharge = dateCharge
        calcPromises.push(calculations(product, due, order, organization, user, seqs.ids[idx]))
      }
      Promise.all(calcPromises).then(values => {
        return resolve(values)
      })
    })
  })
}

function buildTableInvoices (invoices) {
  let rows = ''
  invoices.forEach(invoice => {
    rows = rows + `<tr>
    <td>${invoice.label}</td>
    <td>${moment(invoice.dateCharge).format('MM-DD-YYYY')}</td>
    <td>$${numeral(invoice.price).format('0,0.00')}</td>
    <td>${invoice.paymentDetails.brand}••••${invoice.paymentDetails.last4}</td>
    <td>${capitalize(invoice.status)}</td></tr>`
  })
  return `<table style="width: 100%; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 300; font-family: helvetica, arial, sans-serif; font-size: 14px; color: rgb(102, 102, 102);">
    <thead>
      <tr>
        <th style="font-weight: bold">Description</th>
        <th style="font-weight: bold">Date</th>
        <th style="font-weight: bold">Price</th>
        <th style="font-weight: bold">Account</th>
        <th style="font-weight: bold">Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    </table>`
}

class InvoiceService extends CommonService {
  constructor () {
    super(new InvoiceModel())
  }

  checkout ({order, dues, product, user}) {
    Logger.info('checkout: ' + JSON.stringify(order))
    return new Promise((resolve, reject) => {
      apiUser.get(`/id/${user._id}`)
        .then(response => {
          generateInvoices(order, dues, product, response.data).then(invoices => {
            this.insertMany(invoices).then(result => resolve(result))
            email.sendTemplate(invoices[0].user.userEmail, config.email.templates.checkout, {
              orgName: invoices[0].organizationName,
              userFirstName: invoices[0].user.userFirstName,
              beneficiaryFirstName: invoices[0].beneficiaryFirstName,
              beneficiaryLastName: invoices[0].beneficiaryLastName,
              productName: invoices[0].productName,
              invoices: buildTableInvoices(invoices)
            })
            if (order.preorderId) {
              preorderService.inactive(order.preorderId, 'Payment was authorized')
            } else {
              preorderService.find({
                beneficiaryId: order.beneficiaryId,
                productId: order.productId,
                // planGroupId: order.planGroupId,
                season: order.season,
                assigneeEmail: new RegExp('^' + user.email + '$', 'i'),
                status: 'active'
              }).then(preorders => {
                if (preorders && preorders.length) {
                  let preorder = preorders.reduce((curr, po) => {
                    if (order.planGroupId === po.planGroupId) {
                      curr = po
                    }
                    return curr
                  }, null)
                  if (preorder) {
                    preorderService.inactive(preorder._id, 'Payment was authorized, groupId: ' + order.planGroupId)
                  } else {
                    preorder = preorders[0]
                    const query = (`type:ticket fieldvalue:${preorder._id}`)
                    ZendeskService.search(query).then(tickets => {
                      if (tickets && tickets.length) {
                        let ticket = tickets[0]
                        let tags = ticket.tags.filter(tag => {
                          return tag !== 'signupautomation'
                        })
                        tags.push('ordercreated')
                        ZendeskService.ticketsUpdate(ticket.id, {
                          ticket: {
                            status: 'open',
                            comment: {body: 'Payments authorized but parent has authorized different plan than was assigned. Please double check to make sure they chose the correct plan and if so, deactivate the plan. If not, please reconcile the account and address the issue with the parent.', public: false},
                            tags
                          }
                        }).then(() => {
                          Logger.info('Ticket updated: ' + ticket.id)
                        }).catch(reason => {
                          Logger.critical('ZendeskService.ticketsUpdate id: ' + ticket.id + ' - ' + reason.result.toString('utf8'))
                        })
                      }
                    }).catch(reason => {
                      Logger.critical('ZendeskService.search query: ' + query + ' - ' + reason.result.toString('utf8'))
                    })
                  }
                } else {
                  const query = (`type:ticket requester:${invoices[0].user.userEmail}`)
                  ZendeskService.search(query).then(tickets => {
                    const ticketsFiltered = tickets.filter(tk => {
                      return tk.status === 'pending'
                    })
                    if (ticketsFiltered && ticketsFiltered.length) {
                      let ticket = ticketsFiltered[0]
                      let tags = ticket.tags.filter(tag => {
                        return tag !== 'signupautomation'
                      })
                      tags.push('ordercreated')
                      ZendeskService.ticketsUpdate(ticket.id, {
                        ticket: {
                          status: 'open',
                          comment: {body: 'Payment was authorized.', public: false},
                          tags
                        }
                      }).then(() => {
                        Logger.info('Ticket updated: ' + ticket.id)
                      }).catch(reason => {
                        Logger.critical('ZendeskService.ticketsUpdate id: ' + ticket.id + ' - ' + reason.result.toString('utf8'))
                      })
                    }
                  }).catch(reason => {
                    Logger.critical('ZendeskService.search query: ' + query + ' - ' + reason.result.toString('utf8'))
                  })
                }
              }).catch(reason => {
              })
            }
          })
        }).catch(reason => reject(reason))
    })
  }

  addNote ({ id, note }) {
    return this.model.updateById(id, { $push: { notes: note } })
  }

  webhook ({ id, values }) {
    return this.model.updateById(id, values)
  }

  update (id, values) {
    return this.getById(id).then(invoice => {
      let calculation = Calculations.exec(invoice, values.paymentDetails.paymentMethodtype, invoice.priceBase)
      values.idempotencyKey = randomstring.generate(5)
      values.price = calculation.price
      values.paidupFee = calculation.paidupFee
      values.stripeFee = calculation.processingFee
      values.totalFee = calculation.totalFee
      return this.model.updateById(id, values)
    })
  }

  updateInvoice (id, values, product) {
    values['idempotencyKey'] = randomstring.generate(5)
    const model = this.model
    if (values.unbundle) {
      let calculation = Calculations.exec(product, values.paymentDetails.paymentMethodtype, values.priceBase)
      let dateCharge = new Date(values.dateCharge)
      dateCharge.setUTCHours(16)
      values['dateCharge'] = dateCharge
      values['priceBase'] = values.priceBase
      values['price'] = calculation.price
      values['paidupFee'] = calculation.paidupFee
      values['stripeFee'] = calculation.processingFee
      values['totalFee'] = calculation.totalFee
      values['processingFees'] = product.processingFees
      values['payFees'] = product.payFees
      return model.updateById(id, values)
        .then(result => result)
        .catch(reason => reason)
    }
    return new Promise((resolve, reject) => {
      productPriceV2({
        type: values.paymentDetails.paymentMethodtype,
        capAmount: product.processingFees.achFeeCap,
        originalPrice: values.price,
        stripePercent: product.processingFees.cardFee,
        stripeFlat: product.processingFees.cardFeeFlat,
        stripeAchPercent: product.processingFees.achFee,
        stripeAchFlat: product.processingFees.achFeeFlat,
        paidUpFee: product.collectionFees.fee,
        paidUpFlat: product.collectionFees.feeFlat,
        discount: 0,
        payProcessing: product.payFees.processing,
        payCollecting: product.payFees.collect
      }).exec(
        {
          error: function (err) {
            reject(err)
          },
          success: function (result) {
            let dateCharge = new Date(values.dateCharge)
            dateCharge.setUTCHours(16)
            values['dateCharge'] = dateCharge
            values['priceBase'] = result.basePrice
            values['paidupFee'] = result.feePaidUp
            values['stripeFee'] = result.feeStripe
            values['totalFee'] = result.totalFee
            values['processingFees'] = product.processingFees
            values['payFees'] = product.payFees
            model.updateById(id, values)
              .then(result => resolve(result))
              .catch(reason => reject(reason))
          }
        }
      )
    })
  }

  newInvoice (values, product) {
    const model = this.model
    if (values.unbundle) {
      let calculation = Calculations.exec(product, values.paymentDetails.paymentMethodtype, values.priceBase)
      let dateCharge = new Date(values.dateCharge)
      dateCharge.setUTCHours(16)
      values['dateCharge'] = dateCharge
      values['priceBase'] = values.priceBase
      values['price'] = calculation.price
      values['paidupFee'] = calculation.paidupFee
      values['stripeFee'] = calculation.processingFee
      values['totalFee'] = calculation.totalFee
      values['processingFees'] = product.processingFees
      values['collectionFees'] = product.collectionFees
      values['payFees'] = product.payFees
      return new Promise((resolve, reject) => {
        Sequence.next('invoice', 1).then(seqs => {
          values['invoiceId'] = 'INV' + seqs.ids[0].toUpperCase()
          model.save(values).then(invoice => {
            resolve(invoice)
          }).catch(reason => reject(reason))
        })
      })
    }
    return new Promise((resolve, reject) => {
      productPriceV2({
        type: values.paymentDetails.paymentMethodtype,
        capAmount: product.processingFees.achFeeCap,
        originalPrice: values.price,
        stripePercent: product.processingFees.cardFee,
        stripeFlat: product.processingFees.cardFeeFlat,
        stripeAchPercent: product.processingFees.achFee,
        stripeAchFlat: product.processingFees.achFeeFlat,
        paidUpFee: product.collectionFees.fee,
        paidUpFlat: product.collectionFees.feeFlat,
        discount: 0,
        payProcessing: product.payFees.processing,
        payCollecting: product.payFees.collect
      }).exec(
        {
          error: function (err) {
            reject(err)
          },
          success: function (result) {
            let dateCharge = new Date(values.dateCharge)
            dateCharge.setUTCHours(16)
            values['dateCharge'] = dateCharge
            values['priceBase'] = result.basePrice
            values['paidupFee'] = result.feePaidUp
            values['stripeFee'] = result.feeStripe
            values['totalFee'] = result.totalFee
            values['processingFees'] = product.processingFees
            values['payFees'] = product.payFees
            Sequence.next('invoice', 1).then(seqs => {
              values['invoiceId'] = 'INV' + seqs.ids[0].toUpperCase()
              model.save(values).then(invoice => {
                resolve(invoice)
              }).catch(reason => reject(reason))
            })
          }
        }
      )
    })
  }

  search (criteria) {
    return this.model.find({
      $or: [
        {invoiceId: new RegExp('^' + criteria + '$', 'i')},
        // {beneficiaryFirstName: new RegExp(criteria, 'i')},
        // {beneficiaryLastName: new RegExp(criteria, 'i')},
        // {'user.userFirstName': new RegExp(criteria, 'i')},
        // {'user.userLastName': new RegExp(criteria, 'i')},
        {'user.userEmail': new RegExp('^' + criteria + '$', 'i')}
      ]
    })
  }
}

invoiceService = new InvoiceService()

export default invoiceService
