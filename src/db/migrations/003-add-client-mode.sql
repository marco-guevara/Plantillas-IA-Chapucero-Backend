DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_clients_mode') THEN
    CREATE TYPE enum_clients_mode AS ENUM ('n8n', 'standalone');
  END IF;
END
$$;

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS mode enum_clients_mode NOT NULL DEFAULT 'n8n';

ALTER TYPE enum_laminas_category ADD VALUE IF NOT EXISTS 'general';
