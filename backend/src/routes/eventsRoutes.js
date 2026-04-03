import { Router } from 'express'
import { getAll, create, remove } from '../controllers/eventsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/',      authMiddleware, getAll)
router.post('/',     authMiddleware, create)
router.delete('/:id', authMiddleware, remove)
export default router
