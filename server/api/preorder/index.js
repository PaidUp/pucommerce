import express from 'express'
import { PreorderController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.post('/', auth.validate, PreorderController.save)
router.post('/import', auth.validate, PreorderController.import)

export default router
