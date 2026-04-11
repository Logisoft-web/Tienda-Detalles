import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { authMiddleware } from '../middleware/auth.js'
import { getConfig, updateConfig, getMedia, uploadMedia, deleteMedia } from '../controllers/siteController.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/app/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo imágenes'))
  }
})

const router = Router()
router.get('/config',         getConfig)                              // público
router.put('/config',         authMiddleware, updateConfig)
router.get('/media',          authMiddleware, getMedia)
router.post('/media',         authMiddleware, upload.single('image'), uploadMedia)
router.delete('/media/:id',   authMiddleware, deleteMedia)
export default router
