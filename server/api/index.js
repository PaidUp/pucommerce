import express from 'express'
import order from './order'
import invoice from './invoice'
import preorder from './preorder'
import credit from './credit'
const router = express.Router()

router.use('/order', order)
router.use('/invoice', invoice)
router.use('/preorder', preorder)
router.use('/credit', credit)

export default router
