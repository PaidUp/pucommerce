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

    preorderService.find({beneficiaryId, status: 'active'})
      .then(preorders => {
        return HR.send(res, preorders)
      }).catch(reason => {
        return HR.error(res, reason)
      })
  }
}
