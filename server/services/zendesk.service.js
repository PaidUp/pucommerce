import config from '@/config/environment'
import zendesk from 'node-zendesk'

const client = zendesk.createClient({
  username: config.zendesk.username,
  token: config.zendesk.token,
  remoteUri: `https://${config.zendesk.subdomain}.zendesk.com/api/v2`
})
const cfTicketReasonCategoryId = config.zendesk.customFields.ticketReasonCategory
const cfBalanceId = config.zendesk.customFields.balance
const cfPreoderId = config.zendesk.customFields.preorderId

function getSubject (resp) {
  return `Your ${resp.metadata.organizationName} payment for ${resp.metadata.beneficiaryFirstName + ' ' + resp.metadata.beneficiaryLastName} was declined today.`
}

function getBody (resp) {
  let link = config.zendesk.urlBaseLink + '/' + resp.metadata.beneficiaryId
  return `
  <div>
    <div>Hey ${resp.metadata.userFirstName},</div>
    <br />
    <div>Your ${resp.metadata.organizationName} payment for $${resp.amount / 100} was declined today.</div>
    <div>&nbsp;</div>
    <div>If you have received a new payment account and need to update your payment information, you can do so online by following the steps outlined below. If your form of payment is still valid, please ensure that sufficient funds are available for the transaction and then retry the transaction.</div>
    <div>&nbsp;</div>
    <div>IMPORTANT: Do not visit the "Pay New Invoice" section but rather view the failed invoice from the "Player Payment History" section.</div>
    <div>&nbsp;</div>
    <div>Visit this help article: How do I retry a failed payment?</div>
    <div>&nbsp;</div>
    <div>1. Visit <a href="${link}" target="_blank" rel="noopener">${link}</a> and login to your account</div>
    <div>2. Hit "FIX" on the failed invoice and retry the payment on the same payment account or add a new payment account and hit "RETRY"</div>
    <div>&nbsp;</div>
    <div>If you have any questions or issues, please let me know.</div>
    <div>&nbsp;</div>
    <div>Thanks.</div>
  </div>
  `
}

export default class ZendeskService {
  static userAddProduct ({email, product, beneficiary}) {
    let userFields = {
      athlete_name: beneficiary,
      products: product
    }
    return new Promise((resolve, reject) => {
      client.users.createOrUpdate({
        user: {
          role: 'end-user',
          email,
          user_fields: userFields
        }
      }, (error, response, result) => {
        if (error) return reject(error)
        resolve(result)
      })
    })
  }

  static ticketsCreate ({preorderId, subject, comment, status, requesterEmail, requesterName, ticketAssignee, ticketPriority, cfBalance, cfTicketReasonCategory, ticketTags, isPublic}) {
    return new Promise((resolve, reject) => {
      let customFields = [{id: cfPreoderId, value: preorderId}]
      if (cfBalance) {
        customFields.push({id: cfBalanceId, value: cfBalance})
      }
      if (cfTicketReasonCategory) {
        customFields.push({id: cfTicketReasonCategoryId, value: cfTicketReasonCategory})
      }

      client.tickets.create({
        ticket: {
          subject,
          requester: {
            email: requesterEmail,
            name: requesterName
          },
          comment: {
            html_body: comment
          },
          status,
          priority: ticketPriority,
          assignee_email: ticketAssignee,
          tags: ticketTags,
          isPublic: (isPublic && isPublic.toLowerCase() === 'true'),
          custom_fields: customFields
        }
      }, (error, req, result) => {
        if (error) return reject(error)
        resolve(result)
      })
    })
  }

  static ticketsChargeFailed (resp) {
    const subject = getSubject(resp)
    const comment = getBody(resp)
    const requesterEmail = resp.metadata.userEmail
    const requesterName = resp.metadata.userFirstName + ' ' + resp.metadata.userLastName
    const balance = resp.amount.price
    const invoiceId = resp.metadata.invoiceId

    return new Promise((resolve, reject) => {
      let customFields = [
        { id: config.zendesk.customFields.ticketReasonCategory, value: 'ticket_category_payment_failed_new_card' },
        { id: config.zendesk.customFields.balance, value: balance },
        { id: config.zendesk.customFields.paymentLink, value: config.zendesk.urlBaseLink + '/' + resp.metadata.beneficiaryId },
        { id: config.zendesk.customFields.invoiceId, value: invoiceId }
      ]

      client.tickets.create({
        ticket: {
          subject,
          requester: {
            email: requesterEmail,
            name: requesterName
          },
          comment: {
            html_body: comment
          },
          status: 'pending',
          priority: 'normal',
          assignee: config.zendesk.assignee,
          isPublic: true,
          custom_fields: customFields
        }
      }, (error, req, result) => {
        if (error) return reject(error)
        resolve(result)
      })
    })
  }

  static search (queryStr) {
    return new Promise((resolve, reject) => {
      client.search.query(queryStr, (error, req, results) => {
        if (error) return reject(error)
        resolve(results)
      })
    })
  }

  static ticketsUpdate (id, values) {
    return new Promise((resolve, reject) => {
      client.tickets.update(id, values, (error, data) => {
        if (error) return reject(error)
        resolve(data)
      })
    })
  }
}
