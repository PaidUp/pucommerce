import express from 'express'
import { InvoiceController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/checkout', auth.validate, InvoiceController.checkout)
router.post('/webhook', InvoiceController.webhook)
router.put('/', auth.validate, InvoiceController.update)
router.put('/calculations', auth.validate, InvoiceController.updateCalculations)
router.post('/note', auth.validate, InvoiceController.addNote)
router.get('/method/:paymentMethodId', auth.validate, InvoiceController.getByPaymentMethod)
router.get('/beneficiary/:beneficiaryId', auth.validate, InvoiceController.getInvoicesByBeneficiary)
router.get('/organization/:organizationId', auth.validate, InvoiceController.getInvoicesByOrganization)

export default router
