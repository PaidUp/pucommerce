import express from 'express'
import { OrderController } from '@/controllers'
import { Auth } from 'pu-common'

const router = express.Router()
router.post('/order', Auth.validate, OrderController.save)

export default router
