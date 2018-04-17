// Development specific configuration
// ==================================
const mongoHost = 'pu-dev-shard-00-00-4nodg.mongodb.net:27017,pu-dev-shard-00-01-4nodg.mongodb.net:27017,pu-dev-shard-00-02-4nodg.mongodb.net:27017'
module.exports = {
  port: process.env.PORT || 9013,
  mongo: {
    uri: 'mongodb://' + mongoHost + '/testing',
    prefix: 'pu_commerce_',
    options: {
      user: 'pudevelop',
      pass: 'xEbiMFBtX48ObFgC',
      ssl: true,
      replicaSet: 'pu-dev-shard-0',
      authSource: 'admin',
      autoIndex: false, // Don't build indexes
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 1000, // Reconnect every 500ms
      poolSize: 5 // Maintain up to 5 socket connections
    }
  },
  logger: {
    projectId: 'gothic-talent-192920',
    logName: 'pu-product-test-log',
    metadata: {resource: {type: 'global'}}
  },
  api: {
    organization: {
      url: 'https://devapi.getpaidup.com/api/v1/organization'
    }
  }
}
