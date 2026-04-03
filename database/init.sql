-- ============================================================
-- Hecho con Amor — Base de datos PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(50)  NOT NULL CHECK (category IN ('globos','decoracion','desayunos','propuestas')),
  price       NUMERIC(12,2) NOT NULL,
  image_url   TEXT,
  description TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
  id           SERIAL PRIMARY KEY,
  client_name  VARCHAR(120) NOT NULL,
  client_phone VARCHAR(20),
  event_date   DATE NOT NULL,
  event_type   VARCHAR(80),
  services     JSONB NOT NULL DEFAULT '[]',
  total        NUMERIC(12,2) NOT NULL DEFAULT 0,
  status       VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  client_name  VARCHAR(120),
  event_date   TIMESTAMPTZ NOT NULL,
  color        VARCHAR(20) DEFAULT '#e91e8c',
  quote_id     INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
  notes        TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
  category    VARCHAR(80) NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(150) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20) DEFAULT 'admin',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Datos de ejemplo ──────────────────────────────────────────
INSERT INTO services (name, category, price, description, image_url) VALUES
  ('Arco de Globos',          'globos',     150000, 'Arco decorativo con globos de colores personalizados',          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80'),
  ('Decoración de Habitación','decoracion', 280000, 'Decoración romántica completa con globos, pétalos y luces',     'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'),
  ('Desayuno Sorpresa',       'desayunos',   95000, 'Desayuno gourmet con decoración y mensaje personalizado',       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'),
  ('Propuesta de Matrimonio', 'propuestas', 450000, 'Decoración especial para la propuesta más importante',          'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80'),
  ('Globos Número',           'globos',      45000, 'Globos metálicos en forma de número, dorados o rosados',        'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80'),
  ('Caja de Rosas',           'desayunos',  120000, 'Caja elegante con rosas naturales preservadas',                 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&q=80')
ON CONFLICT DO NOTHING;
