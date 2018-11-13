import express from 'express'
import { InvoiceController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/webhook', InvoiceController.webhook)
router.post('/note', auth.validate, InvoiceController.addNote)
router.post('/invoiceIds', auth.validate, InvoiceController.getByInvoiceIds)
router.put('/', auth.validate, InvoiceController.update)
router.delete('/:id', auth.validate, InvoiceController.delete)
router.put('/calculations', auth.validate, InvoiceController.updateCalculations)
router.put('/new', auth.validate, InvoiceController.newInvoice)
router.get('/method/:paymentMethodId', auth.validate, InvoiceController.getByPaymentMethod)
router.get('/beneficiary/:beneficiaryId', auth.validate, InvoiceController.getInvoicesByBeneficiary)
router.get('/organization/:organizationId', auth.validate, InvoiceController.getInvoicesByOrganization)
router.get('/:id', auth.validate, InvoiceController.getById)

export default router
