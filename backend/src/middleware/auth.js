import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'secret'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' })
  try {
    req.user = jwt.verify(header.slice(7), SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export function superadminMiddleware(req, res, next) {
  if (req.user?.role !== 'superadmin') return res.status(403).json({ error: 'Solo superadmin' })
  next()
}
