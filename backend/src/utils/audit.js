import pool from '../config/database.js'

export async function audit(user, action, entity = null, entityId = null, detail = null) {
  try {
    await pool.query(
      'INSERT INTO audit_log (user_id, username, action, entity, entity_id, detail) VALUES ($1,$2,$3,$4,$5,$6)',
      [user?.id || null, user?.username || 'sistema', action, entity, entityId, detail]
    )
  } catch (_) {}
}
