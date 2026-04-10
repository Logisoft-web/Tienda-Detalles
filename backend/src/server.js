import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes         from './routes/authRoutes.js'
import servicesRoutes     from './routes/servicesRoutes.js'
import quotesRoutes       from './routes/quotesRoutes.js'
import eventsRoutes       from './routes/eventsRoutes.js'
import transactionsRoutes from './routes/transactionsRoutes.js'
import usersRoutes        from './routes/usersRoutes.js'

const app  = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.use('/api/auth',         authRoutes)
app.use('/api/services',     servicesRoutes)
app.use('/api/quotes',       quotesRoutes)
app.use('/api/events',       eventsRoutes)
app.use('/api/transactions', transactionsRoutes)
app.use('/api/users',        usersRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok', app: 'Hecho con Amor API' }))

app.listen(PORT, () => console.log(`🎀 API corriendo en http://localhost:${PORT}`))
