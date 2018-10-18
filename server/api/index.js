import express from 'express'
import invoice from './invoice'
import preorder from './preorder'
import credit from './credit'
import checkout from './checkout'
import search from './search'
const router = express.Router()

router.use('/invoice', invoice)
router.use('/preorder', preorder)
router.use('/credit', credit)
router.use('/checkout', checkout)
router.use('/search', search)

export default router
