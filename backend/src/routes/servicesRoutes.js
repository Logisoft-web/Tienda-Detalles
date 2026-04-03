import { Router } from 'express'
import { getAll, create, update, remove } from '../controllers/servicesController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/',       getAll)                        // público
router.post('/',      authMiddleware, create)
router.put('/:id',    authMiddleware, update)
router.delete('/:id', authMiddleware, remove)
export default router
