import { Router } from 'express'
import { authMiddleware, superadminMiddleware } from '../middleware/auth.js'
import { listUsers, createUser, toggleUser, deleteUser, getAuditLog } from '../controllers/usersController.js'

const router = Router()
router.use(authMiddleware, superadminMiddleware)
router.get('/',           listUsers)
router.post('/',          createUser)
router.patch('/:id/toggle', toggleUser)
router.delete('/:id',    deleteUser)
router.get('/audit',     getAuditLog)
export default router
