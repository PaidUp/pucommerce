import express from 'express'
import { CheckoutController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/', auth.validate, CheckoutController.apply)

export default router
