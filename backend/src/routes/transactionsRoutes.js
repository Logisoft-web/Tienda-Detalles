import { Router } from 'express'
import { getAll, create, getSummary, remove } from '../controllers/transactionsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/summary', authMiddleware, getSummary)
router.get('/',        authMiddleware, getAll)
router.post('/',       authMiddleware, create)
router.delete('/:id',  authMiddleware, remove)
export default router
