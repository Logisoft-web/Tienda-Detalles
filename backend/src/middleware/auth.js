import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' })
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'secret')
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}
