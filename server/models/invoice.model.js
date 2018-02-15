import CommonModel from './common.model'

const contact = {
  label: { type: String, required: true, enum: ['work', 'home'] },
  phone: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, default: [ 'USA' ] },
  zipCode: { type: String, required: true }
}

const verify = {
  token: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, required: true }
}

const resetPassword = {
  token: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, required: true }
}

const schema = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date },
  email: { type: String, lowercase: true, required: true },
  hashedPassword: { type: String },
  salt: { type: String },
  type: { type: String, required: true, enum: [ 'customer', 'functionary', 'organization', 'api', 'service' ] },
  facebookId: { type: String },
  organizationId: { type: String },
  externalAccountId: { type: String },
  contacts: { type: [ contact ], default: [] },
  resetPassword: { type: resetPassword },
  verify: { type: verify },
  roles: { type: Array, default: [ 'parent' ], enum: ['parent', 'coach', 'director'] }
}

export default class OrganizationModel extends CommonModel {
  constructor () {
    super('user', 'users', schema)

    this.schema.path('email').validate(async function (value) {
      try {
        let user = await this.constructor.findOne({ email: value })
        return user === null
      } catch (error) {
        return false
      }
    }, 'The specified email address is already in use.')
  }
}
