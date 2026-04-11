import pool from '../config/database.js'
import { audit } from '../utils/audit.js'

export async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM events ORDER BY event_date ASC')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function create(req, res) {
  const { title, client_name, event_date, color, quote_id, notes, total_value, amount_paid } = req.body
  if (!title || !event_date) return res.status(400).json({ error: 'Campos requeridos' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO events (title,client_name,event_date,color,quote_id,notes,total_value,amount_paid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [title, client_name, event_date, color || '#e91e8c', quote_id || null, notes,
       total_value || null, amount_paid || 0]
    )
    await audit(req.user, 'crear_evento', 'events', rows[0].id, title)
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getById(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM events WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updatePayment(req, res) {
  const { id } = req.params
  const { amount_paid } = req.body
  try {
    // Verificar primero que el evento existe
    const { rows: check } = await pool.query('SELECT id FROM events WHERE id=$1', [id])
    if (!check[0]) return res.status(404).json({ error: `Evento ${id} no encontrado` })

    const { rows } = await pool.query(
      'UPDATE events SET amount_paid=$1 WHERE id=$2 RETURNING *',
      [amount_paid, id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'No se pudo actualizar' })
    await audit(req.user, 'actualizar_pago_evento', 'events', parseInt(id), `pagado: ${amount_paid}`)
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function remove(req, res) {
  const { id } = req.params
  try {
    // Obtener el evento antes de eliminarlo para poder revertir sus transacciones
    const { rows: evRows } = await pool.query('SELECT * FROM events WHERE id=$1', [id])
    if (!evRows[0]) return res.status(404).json({ error: 'No encontrado' })
    const ev = evRows[0]

    // Eliminar transacciones vinculadas por event_id (nuevas) o por descripción (legacy)
    await pool.query(
      `DELETE FROM transactions WHERE event_id=$1 OR (event_id IS NULL AND description ILIKE $2)`,
      [id, `%${ev.title}%`]
    )

    await pool.query('DELETE FROM events WHERE id=$1', [id])
    await audit(req.user, 'eliminar_evento', 'events', parseInt(id), ev.title)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
