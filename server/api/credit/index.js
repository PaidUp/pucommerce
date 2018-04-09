import express from 'express'
import { CreditController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/', auth.validate, CreditController.addCreditMeno)

export default router
