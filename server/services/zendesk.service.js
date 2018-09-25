import config from '@/config/environment'
import zendesk from 'node-zendesk'

const client = zendesk.createClient({
  username: config.zendesk.username,
  token: config.zendesk.token,
  remoteUri: `https://${config.zendesk.subdomain}.zendesk.com/api/v2`
})

export default class ZendeskService {
  static userCreateOrUpdate ({email, name, phone, organization, beneficiary, product}) {
    let userFields = {
      paidup_customer: 'paidupcustomer',
      athlete_name: beneficiary,
      products: product,
      user_type: 'user_type_paidup_customer'
    }
    return new Promise((resolve, reject) => {
      client.users.createOrUpdate({
        user: {
          role: 'end-user',
          email,
          name,
          phone,
          organization_id: organization,
          user_fields: userFields
        }
      }, (error, response) => {
        if (error) return reject(error)
        resolve(response)
      })
    })
  }

  static ticketsCreate ({subject, comment}) {

  }
}
