import pool from '../config/database.js'
import { audit } from '../utils/audit.js'

export async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM services WHERE active = true ORDER BY id')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function create(req, res) {
  const { name, category, price, description, image_url } = req.body
  if (!name || !category || !price) return res.status(400).json({ error: 'Campos requeridos' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO services (name,category,price,description,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, category, price, description, image_url]
    )
    await audit(req.user, 'crear_producto', 'services', rows[0].id, name)
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function update(req, res) {
  const { id } = req.params
  const { name, category, price, description, image_url, active } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE services SET name=$1,category=$2,price=$3,description=$4,image_url=$5,active=$6 WHERE id=$7 RETURNING *',
      [name, category, price, description, image_url, active ?? true, id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    await audit(req.user, 'editar_producto', 'services', parseInt(id), name)
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function remove(req, res) {
  try {
    await pool.query('UPDATE services SET active=false WHERE id=$1', [req.params.id])
    await audit(req.user, 'eliminar_producto', 'services', parseInt(req.params.id))
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
