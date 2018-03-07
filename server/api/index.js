import express from 'express'
import order from './order'
import invoice from './invoice'
const router = express.Router()

router.use('/order', order)
router.use('/invoice', invoice)

export default router
