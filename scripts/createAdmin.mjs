import bcrypt from 'bcryptjs'
import pg from 'pg'

const pool = new pg.Pool({
  host: 'db', port: 5432,
  database: 'hechoconamor',
  user: 'postgres', password: 'postgres'
})

const hash = await bcrypt.hash('D4n3r&2026*.', 10)
await pool.query('DELETE FROM users')
await pool.query(
  'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4)',
  ['admin', 'admin@hechoconamor.com', hash, 'admin']
)
const { rows } = await pool.query('SELECT name, email, LEFT(password,15) as h FROM users')
console.log('Usuario creado:', rows)
await pool.end()
