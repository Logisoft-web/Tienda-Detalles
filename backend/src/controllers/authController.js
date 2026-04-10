import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

const SECRET = process.env.JWT_SECRET || 'secret'

export async function login(req, res) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Campos requeridos' })
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 AND active = TRUE', [username])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    const token = jwt.sign({ id: user.id, username: user.username, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, username: user.username, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
