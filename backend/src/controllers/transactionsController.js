import pool from '../config/database.js'
import { audit } from '../utils/audit.js'

export async function getAll(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM transactions ORDER BY date DESC, created_at DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function create(req, res) {
  const { type, category, amount, description, date } = req.body
  if (!type || !category || !amount || !date) return res.status(400).json({ error: 'Campos requeridos' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO transactions (type,category,amount,description,date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [type, category, amount, description, date]
    )
    await audit(req.user, `crear_transaccion_${type}`, 'transactions', rows[0].id, `${category} $${amount}`)
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getSummary(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
      FROM transactions
    `)
    const { income, expense } = rows[0]
    res.json({ income: Number(income) || 0, expense: Number(expense) || 0, profit: (Number(income) || 0) - (Number(expense) || 0) })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
