import pool from '../config/database.js'

export async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM events ORDER BY event_date ASC')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function create(req, res) {
  const { title, client_name, event_date, color, quote_id, notes } = req.body
  if (!title || !event_date) return res.status(400).json({ error: 'Campos requeridos' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO events (title,client_name,event_date,color,quote_id,notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, client_name, event_date, color || '#e91e8c', quote_id || null, notes]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function remove(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM events WHERE id=$1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'No encontrado' })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
