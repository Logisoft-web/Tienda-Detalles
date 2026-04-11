import { Router } from 'express'
import { getAll, create, updateStatus, remove, clearHistory } from '../controllers/quotesController.js'
import { authMiddleware, superadminMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/',                authMiddleware, getAll)
router.post('/',               authMiddleware, create)
router.patch('/:id/status',    authMiddleware, updateStatus)
router.delete('/history',      authMiddleware, superadminMiddleware, clearHistory)
router.delete('/:id',          authMiddleware, superadminMiddleware, remove)
export default router
