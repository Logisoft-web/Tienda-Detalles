import bcrypt from 'bcryptjs'
import pool from '../config/database.js'
import { audit } from '../utils/audit.js'

export async function listUsers(req, res) {
  try {
    const { rows } = await pool.query('SELECT id, name, username, role, active, created_at FROM users ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function createUser(req, res) {
  const { name, username, password, role = 'admin' } = req.body
  if (!name || !username || !password) return res.status(400).json({ error: 'Campos requeridos' })
  if (!['admin', 'superadmin'].includes(role)) return res.status(400).json({ error: 'Rol inválido' })
  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users (name, username, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, username, role, active, created_at',
      [name, username, hash, role]
    )
    await audit(req.user, 'crear_usuario', 'users', rows[0].id, `username: ${username}, role: ${role}`)
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username ya existe' })
    res.status(500).json({ error: err.message })
  }
}

export async function toggleUser(req, res) {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      'UPDATE users SET active = NOT active WHERE id = $1 RETURNING id, name, username, role, active',
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    await audit(req.user, rows[0].active ? 'activar_usuario' : 'desactivar_usuario', 'users', rows[0].id, `username: ${rows[0].username}`)
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params
  if (parseInt(id) === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' })
  try {
    const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING username', [id])
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    await audit(req.user, 'eliminar_usuario', 'users', parseInt(id), `username: ${rows[0].username}`)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getAuditLog(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
