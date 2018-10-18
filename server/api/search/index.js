import express from 'express'
import { SearchController } from '@/controllers'
import { auth } from 'pu-common'

const router = express.Router()
router.get('/', auth.validate, SearchController.exec)

export default router
