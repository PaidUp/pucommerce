import { preorderService } from '@/services'
import { HandlerResponse as HR } from 'pu-common'

function validateRequired (params) {
  let requireds = params.map(param => {
    let { organizationId, organizationName, beneficiaryId, beneficiaryFirstName, beneficiaryLastName, assigneeEmail } = param
    return { organizationId, organizationName, beneficiaryId, beneficiaryFirstName, beneficiaryLastName, assigneeEmail }
  })
  let messages = []
  requireds.forEach((row, idx) => {
    Object.keys(row).forEach(key => {
      if (!row[key]) {
        messages.push(`Line ${idx + 1}: ${key} is required`)
      }
    })
  })
  return messages
}

export default class PreorderCotroller {
  static save (req, res) {
    let message = validateRequired([req.body])

    if (message.length) {
      return HR.error(res, message.join(', '), 422)
    }
    preorderService.save(req.body)
      .then(order => {
        return HR.send(res, order)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static update (req, res) {
    let { id, values } = req.body

    if (!id) return HR.error(res, 'id is required', 422)
    if (!values) return HR.error(res, 'values is required', 422)

    preorderService.updateById(id, values)
      .then(preorder => {
        return HR.send(res, preorder)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static import (req, res) {
    let message = validateRequired(req.body)

    if (message.length) {
      return HR.error(res, message.join(', '), 422)
    }
    preorderService.insertMany(req.body)
      .then(order => {
        return HR.send(res, order)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static getByBeneficiary (req, res) {
    let beneficiaryId = req.params.beneficiaryId
    if (!beneficiaryId) return HR.error(res, 'beneficiaryId is required', 422)

    if (!req.params.beneficiaryId) return HR.error(res, 'beneficiaryId is required', 422)
    let params = {
      beneficiaryId: req.params.beneficiaryId
    }
    const assignee = req.query.assegnee
    if (assignee) params['assigneeEmail'] = assignee
    preorderService.find(params)
      .then(preorders => {
        return HR.send(res, preorders)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static getByOrganization (req, res) {
    let organizationId = req.params.organizationId
    const season = req.query.seasonId
    const productId = req.query.productId
    const beneficiaryId = req.query.beneficiaryId
    if (!organizationId) return HR.error(res, 'organizationId is required', 422)
    if (!season) return HR.error(res, 'seasonId is required', 422)
    let values = {organizationId, season, status: 'active'}
    if (productId) values.productId = productId
    if (beneficiaryId) values.beneficiaryId = beneficiaryId
    preorderService.find(values)
      .then(preorders => {
        return HR.send(res, preorders)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }

  static bulk (req, res) {
    console.log('into controller')
    const email = req.user.email
    if (!req.file) return HR.error(res, 'files is required', 422)
    preorderService.bulkPreorders(req.file.buffer, email)
    return HR.send(res, {})
  }
}
