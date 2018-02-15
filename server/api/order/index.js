import express from 'express'
import { OrderController } from '@/controllers'
import { validate } from '@/util/auth'

const router = express.Router()
router.post('/order', validate, OrderController.save)

export default router
