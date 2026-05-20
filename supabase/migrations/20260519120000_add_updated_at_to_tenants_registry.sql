-- Add updated_at to tenants_registry and keep it auto-updated on changes
ALTER TABLE IF EXISTS tenants_registry
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tenants_registry_updated_at ON tenants_registry;
CREATE TRIGGER update_tenants_registry_updated_at
BEFORE UPDATE ON tenants_registry
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
