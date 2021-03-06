import express from 'express'
import { CreditController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/checkout', auth.validate, CreditController.checkout)
router.post('/', auth.validate, CreditController.addCreditMeno)
router.put('/', auth.validate, CreditController.update)
router.delete('/:id', auth.validate, CreditController.delete)
router.get('/beneficiary/:beneficiaryId', auth.validate, CreditController.getByBeneficiary)
router.get('/organization/:organizationId', auth.validate, CreditController.getByOrganization)

export default router
