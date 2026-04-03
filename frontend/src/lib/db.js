/**
 * Schema de base de datos — SQLite (via better-sqlite3 en backend)
 * 
 * Para producción conectar con un backend Express/Node.
 * Aquí se usa localStorage como mock para demo.
 */

export const DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS services (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,          -- 'globos' | 'desayunos' | 'decoracion' | 'propuestas'
  price     REAL NOT NULL,
  image_url TEXT,
  description TEXT,
  active    INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  event_date  DATE NOT NULL,
  event_type  TEXT NOT NULL,
  services    TEXT NOT NULL,        -- JSON array of service ids
  total       REAL NOT NULL,
  status      TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  notes       TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  client_name TEXT,
  event_date  DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  color       TEXT DEFAULT '#e91e8c',
  quote_id    INTEGER REFERENCES quotes(id),
  notes       TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT NOT NULL,        -- 'income' | 'expense'
  category    TEXT NOT NULL,
  amount      REAL NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

// ── Mock data helpers (localStorage) ──────────────────────────────────────────

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

// Services
export const servicesDB = {
  getAll: () => load('hca_services', SAMPLE_SERVICES),
  save: (items) => save('hca_services', items),
}

// Quotes
export const quotesDB = {
  getAll: () => load('hca_quotes', []),
  add: (q) => { const all = quotesDB.getAll(); const item = { ...q, id: Date.now() }; save('hca_quotes', [...all, item]); return item },
  update: (id, data) => { const all = quotesDB.getAll().map(q => q.id === id ? { ...q, ...data } : q); save('hca_quotes', all) },
}

// Events
export const eventsDB = {
  getAll: () => load('hca_events', SAMPLE_EVENTS),
  add: (e) => { const all = eventsDB.getAll(); const item = { ...e, id: Date.now() }; save('hca_events', [...all, item]); return item },
  update: (id, data) => { const all = eventsDB.getAll().map(e => e.id === id ? { ...e, ...data } : e); save('hca_events', all) },
  remove: (id) => save('hca_events', eventsDB.getAll().filter(e => e.id !== id)),
}

// Transactions
export const transactionsDB = {
  getAll: () => load('hca_transactions', SAMPLE_TRANSACTIONS),
  add: (t) => { const all = transactionsDB.getAll(); const item = { ...t, id: Date.now() }; save('hca_transactions', [...all, item]); return item },
}

// ── Sample data ────────────────────────────────────────────────────────────────

const SAMPLE_SERVICES = [
  { id: 1, name: 'Arco de Globos', category: 'globos', price: 150000, description: 'Arco decorativo con globos de colores personalizados', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80', active: 1 },
  { id: 2, name: 'Decoración de Habitación', category: 'decoracion', price: 280000, description: 'Decoración romántica completa con globos, pétalos y luces', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', active: 1 },
  { id: 3, name: 'Desayuno Sorpresa', category: 'desayunos', price: 95000, description: 'Desayuno gourmet con decoración y mensaje personalizado', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', active: 1 },
  { id: 4, name: 'Propuesta de Matrimonio', category: 'propuestas', price: 450000, description: 'Decoración especial para la propuesta más importante', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80', active: 1 },
  { id: 5, name: 'Globos Número', category: 'globos', price: 45000, description: 'Globos metálicos en forma de número, dorados o rosados', image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80', active: 1 },
  { id: 6, name: 'Caja de Rosas', category: 'desayunos', price: 120000, description: 'Caja elegante con rosas naturales preservadas', image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80', active: 1 },
]

const today = new Date()
const SAMPLE_EVENTS = [
  { id: 1, title: 'Decoración Cumpleaños Ana', client_name: 'Ana García', event_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString(), color: '#e91e8c' },
  { id: 2, title: 'Propuesta Matrimonio', client_name: 'Carlos López', event_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(), color: '#e8b923' },
  { id: 3, title: 'Desayuno Aniversario', client_name: 'María Torres', event_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString(), color: '#ff80aa' },
]

const SAMPLE_TRANSACTIONS = [
  { id: 1, type: 'income', category: 'Decoración', amount: 280000, description: 'Decoración habitación - Ana García', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0] },
  { id: 2, type: 'income', category: 'Globos', amount: 150000, description: 'Arco de globos - Fiesta infantil', date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0] },
  { id: 3, type: 'expense', category: 'Materiales', amount: 85000, description: 'Compra globos y cintas', date: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().split('T')[0] },
  { id: 4, type: 'income', category: 'Desayunos', amount: 95000, description: 'Desayuno sorpresa - Carlos', date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0] },
  { id: 5, type: 'expense', category: 'Transporte', amount: 25000, description: 'Domicilio decoración', date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().split('T')[0] },
]
