import pool from '../config/database.js'

export async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function create(req, res) {
  const { client_name, client_phone, event_date, event_type, services, total, notes } = req.body
  if (!client_name || !event_date) return res.status(400).json({ error: 'Campos requeridos' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO quotes (client_name,client_phone,event_date,event_type,services,total,notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [client_name, client_phone, event_date, event_type, JSON.stringify(services || []), total || 0, notes]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateStatus(req, res) {
  const { id } = req.params
  const { status } = req.body
  const valid = ['pending', 'confirmed', 'cancelled']
  if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' })
  try {
    const { rows } = await pool.query('UPDATE quotes SET status=$1 WHERE id=$2 RETURNING *', [status, id])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}
