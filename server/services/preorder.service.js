import { PreorderModel } from '@/models'
import CommonService from './common.service'
import { Email } from 'pu-common'
import emailValidator from 'email-validator'
import stream from 'stream'
import { Parser as Json2csvParser } from 'json2csv'
import csv from 'fast-csv'
import ApiService from './api.service'
import config from '@/config/environment'

const email = new Email(config.email.options)
let preorderService

class PreorderService extends CommonService {
  constructor () {
    super(new PreorderModel())
  }

  bulkPreorders (buffer, userEmail) {
    console.log('into met')
    let model = this.model
    let result = []
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
              const beneficiaryId = data.beneficiaryId.trim()
              // const beneficiaryFirstName = data.beneficiaryFirstName.trim()
              // const beneficiaryLastName = data.beneficiaryLastName.trim()
              const parentEmail = data.parentEmail.trim()
              if (!emailValidator.validate(parentEmail)) {
                data.status = 'Invalid email'
                return next(null, data)
              }
              // const parentFirstName = data.parentFirstName.trim()
              // const parentLastName = data.parentLastName.trim()
              const paymentPlanId = data.paymentPlanId.trim()
              const plan = mapPlans[paymentPlanId]
              if (!plan) {
                data.status = 'plan not exist'
                return next(null, data)
              }
              const product = mapProducts[plan.productId]
              if (!product) {
                data.status = 'product not exist'
                return next(null, data)
              }
              const entity = {
                organizationId: product.organizationId,
                productId: product._id,
                productName: product.productName,
                beneficiaryId,
                planId: plan._id,
                season: product.season,
                credits: plan.credits,
                dues: plan.dues,
                assigneeEmail: parentEmail,
                status: 'active'
              }
              model.save(entity).then(res => {
                data.status = 'Beneficiary added'
                data.preOrderId = res._id
                return next(null, data)
              }).catch(reason => {
                data.status = reason.toString()
                return next(null, data)
              })
            })
            .on('data', function (data) {
              result.push(data)
            })
            .on('end', function () {
              const fields = ['beneficiaryId', 'beneficiaryFirstName', 'beneficiaryLastName', 'parentEmail', 'parentFirstName', 'parentLastName', 'paymentPlanId', 'preOrderId', 'status']
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
