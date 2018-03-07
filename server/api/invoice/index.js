import express from 'express'
import { InvoiceController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/note', auth.validate, InvoiceController.addNote)

export default router
