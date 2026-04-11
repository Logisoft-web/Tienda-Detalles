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
  event_id    INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Migración: agregar event_id si no existe (para bases de datos ya creadas)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS event_id INTEGER;

-- Migración: agregar total_value y amount_paid a events si no existen
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_value  NUMERIC(12,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS amount_paid  NUMERIC(12,2) DEFAULT 0;

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

CREATE TABLE IF NOT EXISTS media (
  id         SERIAL PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  url        TEXT NOT NULL,
  size       INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_config (
  key   VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO site_config (key, value) VALUES
  ('hero_title',    'Detalles que enamoran'),
  ('hero_subtitle', 'Flores eternas, peluches y accesorios únicos para cada ocasión especial. Porque los mejores momentos merecen el mejor detalle.'),
  ('hero_images',   '["/galeria/flores-eternas-01.jpg","/galeria/peluche-01.jpg","/galeria/arreglo-floral-03.jpg","/galeria/regalo-01.jpg"]'),
  ('gallery_images','["/galeria/flores-eternas-01.jpg","/galeria/peluche-01.jpg","/galeria/regalo-01.jpg","/galeria/accesorio-01.jpg","/galeria/detalle-01.jpg","/galeria/flores-eternas-02.jpg","/galeria/arreglo-floral-03.jpg","/galeria/peluche-02.jpg","/galeria/regalo-02.jpg","/galeria/accesorio-02.jpg","/galeria/detalle-02.jpg","/galeria/arreglo-floral-04.jpg"]'),
  ('testimonials',  '[{"name":"Laura M.","text":"Las flores eternas son hermosas, llevan meses y siguen perfectas. Un regalo increíble.","stars":5},{"name":"Carlos R.","text":"Compré un peluche para el cumpleaños de mi novia y quedó encantada. Muy buena calidad.","stars":5},{"name":"Valentina P.","text":"Los accesorios son únicos, no los encuentras en otro lado. Siempre vuelvo a comprar.","stars":5}]')
ON CONFLICT DO NOTHING;

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
