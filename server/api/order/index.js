import express from 'express'
import { OrderController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/order', auth.validate, OrderController.generate)

export default router
