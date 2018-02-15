import api from './api'
import cors from 'cors'

export default function (app) {
  app.use(cors())

  // Insert routes below
  app.use('/api/v1/commerce', api)

  app.route('/*').get(function (request, response) {
    response.status(200).json({ PU: 'Commerce!!!' })
  })
}
