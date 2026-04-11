import { Router } from 'express'
import { getAll, getById, create, remove, updatePayment } from '../controllers/eventsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/',              authMiddleware, getAll)
router.get('/:id',           authMiddleware, getById)
router.post('/',             authMiddleware, create)
router.patch('/:id/payment', authMiddleware, updatePayment)
router.delete('/:id',        authMiddleware, remove)
export default router
