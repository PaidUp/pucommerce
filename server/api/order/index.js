import express from 'express'
import { OrderController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/', auth.validate, OrderController.generate)
router.get('/beneficiary', auth.validate, OrderController.getOrdersByBeneficiary)

export default router
