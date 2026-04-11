import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pool from './config/database.js'
import authRoutes         from './routes/authRoutes.js'
import servicesRoutes     from './routes/servicesRoutes.js'
import quotesRoutes       from './routes/quotesRoutes.js'
import eventsRoutes       from './routes/eventsRoutes.js'
import transactionsRoutes from './routes/transactionsRoutes.js'
import usersRoutes        from './routes/usersRoutes.js'
import siteRoutes         from './routes/siteRoutes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 4000

// Migraciones automáticas — columnas nuevas en tablas existentes
async function runMigrations() {
  try {
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS total_value NUMERIC(12,2)')
    await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12,2) DEFAULT 0')
    await pool.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS event_id INTEGER')
    console.log('✅ Migraciones aplicadas')
  } catch (err) {
    console.error('⚠️ Error en migraciones:', err.message)
  }
}

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('/app/uploads'))

app.use('/api/auth',         authRoutes)
app.use('/api/services',     servicesRoutes)
app.use('/api/quotes',       quotesRoutes)
app.use('/api/events',       eventsRoutes)
app.use('/api/transactions', transactionsRoutes)
app.use('/api/users',        usersRoutes)
app.use('/api/site',         siteRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Hecho con Amor API' }))

runMigrations().then(() => {
  app.listen(PORT, () => console.log(`🎀 API corriendo en http://localhost:${PORT}`))
})
