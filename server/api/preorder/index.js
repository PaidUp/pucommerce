import express from 'express'
import { PreorderController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.get('/beneficiary/:beneficiaryId', auth.validate, PreorderController.getByBeneficiary)
router.get('/organization/:organizationId', auth.validate, PreorderController.getByOrganization)
router.post('/', auth.validate, PreorderController.save)
router.post('/import', auth.validate, PreorderController.import)
router.put('/', auth.validate, PreorderController.update)
router.put('/many', auth.validate, PreorderController.updateMany)

export default router
