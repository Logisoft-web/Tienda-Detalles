-- ============================================================
-- Hecho con Amor — Base de datos PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(50)  NOT NULL CHECK (category IN ('flores','peluches','accesorios','regalos','globos','decoracion','desayunos','propuestas')),
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
  username     VARCHAR(80)  UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20)  DEFAULT 'admin' CHECK (role IN ('superadmin','admin')),
  active       BOOLEAN      DEFAULT TRUE,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username    VARCHAR(80),
  action      VARCHAR(80) NOT NULL,
  entity      VARCHAR(80),
  entity_id   INTEGER,
  detail      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Datos de ejemplo ──────────────────────────────────────────
INSERT INTO services (name, category, price, description, image_url) VALUES
  ('Flores Eternas Rosas',      'flores',    85000,  'Rosas preservadas que duran años sin perder su belleza natural',           '/galeria/flores-eternas-01.jpg'),
  ('Arreglo Floral Premium',    'flores',    120000, 'Arreglo con flores eternas en caja elegante, ideal para regalar',          '/galeria/arreglo-floral-01.jpg'),
  ('Flores Eternas Mixtas',     'flores',    95000,  'Combinación de flores eternas en colores variados, presentación especial', '/galeria/flores-eternas-02.jpg'),
  ('Peluche Oso Grande',        'peluches',  65000,  'Oso de peluche suave y adorable, perfecto para toda ocasión',             '/galeria/peluche-01.jpg'),
  ('Peluche Personalizado',     'peluches',  75000,  'Peluche premium con lazo y mensaje personalizado',                        '/galeria/peluche-02.jpg'),
  ('Accesorio Especial',        'accesorios',45000,  'Accesorio único y elegante para complementar cualquier regalo',           '/galeria/accesorio-01.jpg'),
  ('Set de Accesorios',         'accesorios',80000,  'Conjunto de accesorios seleccionados para una ocasión especial',          '/galeria/accesorio-02.jpg'),
  ('Caja Regalo Sorpresa',      'regalos',   110000, 'Caja decorada con productos seleccionados para sorprender',               '/galeria/regalo-01.jpg'),
  ('Detalle Romántico',         'regalos',   90000,  'Detalle especial para celebrar el amor en cualquier momento',             '/galeria/detalle-01.jpg')
ON CONFLICT DO NOTHING;
