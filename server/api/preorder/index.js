import express from 'express'
import { PreorderController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.get('/beneficiary/:beneficiaryId', auth.validate, PreorderController.getByBeneficiary)
router.post('/', auth.validate, PreorderController.save)
router.post('/import', auth.validate, PreorderController.import)

export default router
