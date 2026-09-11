DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_laminas_category') THEN
    CREATE TYPE enum_laminas_category AS ENUM ('lps', 'lpm', 'lm', 'li');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_laminas_status') THEN
    CREATE TYPE enum_laminas_status AS ENUM (
      'draft',
      'saved',
      'generated',
      'published',
      'archived'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_lamina_assets_type') THEN
    CREATE TYPE enum_lamina_assets_type AS ENUM (
      'principal',
      'imagen1',
      'circulo1',
      'circulo2',
      'generated916',
      'generated340',
      'other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_publish_jobs_network') THEN
    CREATE TYPE enum_publish_jobs_network AS ENUM ('facebook', 'instagram', 'x');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_publish_jobs_status') THEN
    CREATE TYPE enum_publish_jobs_status AS ENUM ('pending', 'success', 'failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_webhook_events_status') THEN
    CREATE TYPE enum_webhook_events_status AS ENUM ('success', 'error');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS laminas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  legacy_id VARCHAR(120),
  category enum_laminas_category NOT NULL,
  original_user VARCHAR(160),
  title TEXT,
  status enum_laminas_status NOT NULL DEFAULT 'draft',
  url_916 TEXT,
  url_340 TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lamina_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lamina_id UUID REFERENCES laminas(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  type enum_lamina_assets_type NOT NULL DEFAULT 'other',
  source_url TEXT,
  uploaded_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publish_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lamina_id UUID REFERENCES laminas(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  network enum_publish_jobs_network NOT NULL,
  status enum_publish_jobs_status NOT NULL DEFAULT 'pending',
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB,
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  lamina_id UUID REFERENCES laminas(id) ON DELETE SET NULL,
  webhook_name VARCHAR(120) NOT NULL,
  endpoint TEXT NOT NULL,
  method VARCHAR(12) NOT NULL,
  status enum_webhook_events_status NOT NULL,
  status_code INTEGER,
  duration_ms INTEGER,
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_laminas_client_id
  ON laminas(client_id);

CREATE INDEX IF NOT EXISTS idx_laminas_category_status
  ON laminas(category, status);

CREATE INDEX IF NOT EXISTS idx_laminas_legacy_id
  ON laminas(legacy_id);

CREATE INDEX IF NOT EXISTS idx_lamina_assets_lamina_id
  ON lamina_assets(lamina_id);

CREATE INDEX IF NOT EXISTS idx_lamina_assets_client_id
  ON lamina_assets(client_id);

CREATE INDEX IF NOT EXISTS idx_publish_jobs_lamina_id
  ON publish_jobs(lamina_id);

CREATE INDEX IF NOT EXISTS idx_publish_jobs_client_network
  ON publish_jobs(client_id, network, status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_lamina_id
  ON webhook_events(lamina_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_client_id
  ON webhook_events(client_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_name_created
  ON webhook_events(webhook_name, created_at DESC);
