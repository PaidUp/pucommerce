import express from 'express'
import invoice from './invoice'
import preorder from './preorder'
import credit from './credit'
import checkout from './checkout'
const router = express.Router()

router.use('/invoice', invoice)
router.use('/preorder', preorder)
router.use('/credit', credit)
router.use('/checkout', checkout)

export default router
