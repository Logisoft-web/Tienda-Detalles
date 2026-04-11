import pool from '../config/database.js'
import { audit } from '../utils/audit.js'

export async function getConfig(req, res) {
  try {
    const { rows } = await pool.query('SELECT key, value FROM site_config')
    const config = {}
    rows.forEach(r => {
      try { config[r.key] = JSON.parse(r.value) } catch { config[r.key] = r.value }
    })
    res.json(config)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function updateConfig(req, res) {
  const { key, value } = req.body
  if (!key || value === undefined) return res.status(400).json({ error: 'key y value requeridos' })
  try {
    const val = typeof value === 'string' ? value : JSON.stringify(value)
    await pool.query(
      'INSERT INTO site_config (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',
      [key, val]
    )
    await audit(req.user, 'editar_config', 'site_config', null, key)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function getMedia(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM media ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function uploadMedia(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' })
  try {
    const url = `/uploads/${req.file.filename}`
    const { rows } = await pool.query(
      'INSERT INTO media (filename, url, size) VALUES ($1,$2,$3) ON CONFLICT (filename) DO UPDATE SET url=$2 RETURNING *',
      [req.file.filename, url, req.file.size]
    )
    await audit(req.user, 'subir_imagen', 'media', rows[0].id, req.file.filename)
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export async function deleteMedia(req, res) {
  const { id } = req.params
  try {
    const { rows } = await pool.query('DELETE FROM media WHERE id=$1 RETURNING filename', [id])
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' })
    await audit(req.user, 'eliminar_imagen', 'media', parseInt(id), rows[0].filename)
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
}
