import express from 'express'
import { InvoiceController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/note', auth.validate, InvoiceController.addNote)
router.get('/method/:paymentMethodId', auth.validate, InvoiceController.getByPaymentMethod)

export default router
