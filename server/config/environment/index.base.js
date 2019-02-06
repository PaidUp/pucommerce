import _ from 'lodash'
import develop from './develop'
import production from './production'
import test from './test'
import stage from './stage'

const mongoHost = 'pu-dev-shard-00-00-4nodg.mongodb.net:27017,pu-dev-shard-00-01-4nodg.mongodb.net:27017,pu-dev-shard-00-02-4nodg.mongodb.net:27017'

const envs = {
  develop,
  production,
  test,
  stage
}

// All configurations will extend these options
// ============================================
let all = {
  port: process.env.PORT || 9003,
  mongo: {
    uri: 'mongodb://' + mongoHost + '/develop',
    prefix: 'pu_commerce_',
    options: {
      user: 'pudevelop',
      pass: 'xEbiMFBtX48ObFgC',
      ssl: true,
      replicaSet: 'pu-dev-shard-0',
      authSource: 'admin',
      useNewUrlParser: true,
      autoIndex: false, // Don't build indexes
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 1000, // Reconnect every 500ms
      poolSize: 5 // Maintain up to 10 socket connections
    }
  },
  auth: {
    credential: 'puproduct-secret',
    host: 'redis-13835.c16.us-east-1-3.ec2.cloud.redislabs.com',
    port: 13835,
    key: 'JF06f7FJjTDkNOcM1sdywWw5CZBHW4Jy'
  },
  sequence: {
    functionName: 'sequence:develop',
    db: '1',
    host: 'develop.rd7ge9.ng.0001.use1.cache.amazonaws.com',
    port: '6379'
  },
  logger: {
    projectId: 'gothic-talent-192920',
    logName: 'pu-product-dev-log',
    metadata: {resource: {type: 'global'}}
  },
  encryptKey: 'PZ3oXv2v6Pq5HAPFI9NFbQ==',
  api: {
    organization: {
      url: 'http://localhost:9002/api/v1/organization'
    },
    user: {
      url: 'http://localhost:9001/api/v1/user'
    }
  },
  contract: {
    username: 'api_kHDbL5jE5Xrna4dK',
    password: 'AZvX7-712ZbuuJGBLawPbGxCCE1mreKBtFswrwDHzeg'
  },
  stripe: {
    key: 'sk_test_wE4QBHe2SZH9wZ6uMZliup0g',
    webhook: 'whsec_RkR36aQwiWeYqwNo6uqOQr7Sg3tKqjj0'
  },
  email: {
    options: {
      apiKey: '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',
      fromName: 'Support',
      fromEmail: 'support@getpaidup.com'
    },
    templates: {
      checkout: 'e6be06bd-d125-4dd6-914d-2085f2382441'
    }
  },
  zendesk: {
    urlBaseLink: 'http://localhost:8080/players',
    username: 'ricardo@getpaidup.com',
    token: '6ON1frWgVv8acTGZNnabBMjj500JZA8vmGK2rNeb',
    subdomain: 'getpaidup1478060212',
    assignee: '373035927993',
    assigneeEmail: 'felipe@getpaidup.com',
    customFields: {
      preorderId: '360008982873',
      ticketReasonCategory: '48042408',
      balance: '56485848',
      paymentLink: '80373287',
      invoiceId: '360014425333'
    }
  },
  bugsnag: {
    apiKey: '13fa1c9fc56101af4ecb42f06c14c17b',
    projectRoot: '/app',
    notifyReleaseStages: [ 'production', 'stage', 'develop' ]
  }
}

if (process.env.NODE_ENV) {
  all = _.merge(
    all,
    envs[process.env.NODE_ENV] || {})
}

// Export the config object based on the NODE_ENV
// ==============================================
export default all
