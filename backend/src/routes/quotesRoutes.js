import { Router } from 'express'
import { getAll, create, updateStatus } from '../controllers/quotesController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/',           authMiddleware, getAll)
router.post('/',          authMiddleware, create)
router.patch('/:id/status', authMiddleware, updateStatus)
export default router
