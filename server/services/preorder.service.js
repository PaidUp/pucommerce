import { PreorderModel } from '@/models'
import CommonService from './common.service'
import { Email } from 'pu-common'
import emailValidator from 'email-validator'
import stream from 'stream'
import { Parser as Json2csvParser } from 'json2csv'
import csv from 'fast-csv'
import ApiService from './api.service'
import config from '@/config/environment'
import ZendeskService from './zendesk.service'

const email = new Email(config.email.options)
let preorderService

function replaceText (values, text) {
  Object.keys(values).forEach(key => {
    text = text.replace(new RegExp('{{' + key + '}}'), values[key])
  })
  return text
}

class PreorderService extends CommonService {
  constructor () {
    super(new PreorderModel())
  }

  bulkPreorders (buffer, userEmail, comment, subject) {
    let model = this.model
    let result = []
    // let header = buffer.toString('utf8').split('\r')[0].split(',')
    let bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)

    return new Promise((resolve, reject) => {
      try {
        Promise.all([
          ApiService.organization.get('/plan/all'),
          ApiService.organization.get('/product/all')
        ]).then(orgValues => {
          let mapPlans = orgValues[0].data.reduce((curr, plan) => {
            curr[plan._id] = plan
            return curr
          }, {})
          let mapProducts = orgValues[1].data.reduce((curr, product) => {
            curr[product._id] = product
            return curr
          }, {})
          csv.fromStream(bufferStream, {headers: true})
            .transform((data, next) => {
              const beneficiaryId = data.beneficiaryId
              const beneficiaryFirstName = data.beneficiaryFirstName
              const beneficiaryLastName = data.beneficiaryLastName
              const parentEmail = data.parentEmail
              if (!emailValidator.validate(parentEmail)) {
                data.status = 'Invalid email'
                return next(null, data)
              }
              const parentFirstName = data.parentFirstName
              const parentLastName = data.parentLastName
              const parentPhoneNumber = data.parentPhoneNumber
              const zdOrganizationId = data.zdOrganizationId
              const paymentPlanId = data.paymentPlanId
              const plan = mapPlans[paymentPlanId]
              const cfBalance = plan.dues.reduce((curr, due) => {
                return curr + due.amount
              }, 0)

              if (!plan) {
                data.status = 'Payment plan does not exist'
                return next(null, data)
              }
              const product = mapProducts[plan.productId]
              if (!product) {
                data.status = 'Product does not exist'
                return next(null, data)
              }

              const ticketStatus = data.ticketStatus
              const ticketAssignee = data.ticketAssignee
              const ticketPriority = data.ticketPriority
              const cfTicketReasonCategory = data.cfTicketReasonCategory
              const ticketTags = data.ticketTags ? data.ticketTags.split('|') : []
              const isPublic = data.isPublic

              const entity = {
                organizationId: product.organizationId,
                productId: product._id,
                productName: product.name,
                beneficiaryId,
                planId: plan._id,
                season: product.season,
                credits: plan.credits,
                dues: plan.dues,
                assigneeEmail: parentEmail,
                status: 'active'
              }
              model.save(entity).then(res => {
                data.status = 'Preorder added'
                data.preOrderId = res._id
                ZendeskService.userCreateOrUpdate({
                  email: parentEmail,
                  name: parentFirstName + ' ' + parentLastName,
                  phone: parentPhoneNumber,
                  organization: zdOrganizationId,
                  beneficiary: beneficiaryFirstName + ' ' + beneficiaryLastName,
                  product: product.name
                }).then(res => {
                  data.zendeskParentInsertResult = 'parent added'
                  ZendeskService.ticketsCreate({
                    subject: replaceText(data, subject),
                    comment: replaceText(data, comment),
                    status: ticketStatus,
                    requesterEmail: parentEmail,
                    requesterName: parentFirstName + '' + parentLastName,
                    ticketAssignee,
                    ticketPriority,
                    cfBalance,
                    cfTicketReasonCategory,
                    ticketTags,
                    isPublic
                  }).then(res => {
                    data.zendeskTicketResult = 'ticket created'
                    return next(null, data)
                  }).catch(reason => {
                    data.zendeskTicketResult = 'ticket failed'
                    return next(null, data)
                  })
                }).catch(reason => {
                  data.zendeskParentInsertResult = 'parent failed'
                  return next(null, data)
                })
              }).catch(reason => {
                data.status = reason.toString()
                return next(null, data)
              })
            })
            .on('data', function (data) {
              result.push(data)
            })
            .on('end', function () {
              const fields = ['beneficiaryId', 'beneficiaryFirstName', 'beneficiaryLastName', 'parentEmail', 'parentFirstName', 'parentLastName', 'paymentPlanId', 'preOrderId', 'status', 'zendeskParentInsertResult', 'zendeskTicketResult']
              const json2csvParser = new Json2csvParser({ fields })
              const csv = json2csvParser.parse(result)
              const attachment = {
                content: Buffer.from(csv).toString('base64'),
                fileName: 'PreorderAssignmentResult.csv',
                type: 'application/octet-stream'
              }
              email.sendEmail(userEmail, 'Preorder Assignment Result', 'Hi,<br> The preorder bulk result was attached', [attachment])
              resolve(csv)
            })
        })
      } catch (reason) {
        reject(reason)
      }
    })
  }
}

preorderService = new PreorderService()

export default preorderService
