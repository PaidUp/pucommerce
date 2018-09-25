import express from 'express'
import { PreorderController } from '@/controllers'
import { auth } from 'pu-common'
import connect from 'connect'
import multer from 'multer'

let uploadMemory = multer({ storage: multer.memoryStorage() })

let combinedMemoryMiddleware = (function () {
  let chain = connect();
  [auth.validate, uploadMemory.single('file')].forEach(function (middleware) {
    chain.use(middleware)
  })
  return chain
})()

const router = express.Router()
router.get('/beneficiary/:beneficiaryId', auth.validate, PreorderController.getByBeneficiary)
router.get('/organization/:organizationId', auth.validate, PreorderController.getByOrganization)
router.post('/bulk', combinedMemoryMiddleware, PreorderController.bulk)
router.put('/', auth.validate, PreorderController.update)
router.post('/', auth.validate, PreorderController.save)
router.post('/import', auth.validate, PreorderController.import)

export default router
