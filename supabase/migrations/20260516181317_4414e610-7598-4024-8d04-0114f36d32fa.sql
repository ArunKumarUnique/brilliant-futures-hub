
-- Platform admins (super admins managing all tenants)
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  mobile text NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'PLATFORM_ADMIN',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on platform_admins" ON public.platform_admins FOR ALL USING (true) WITH CHECK (true);

-- Tenant registry (onboarded institutes)
CREATE TABLE public.tenants_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL UNIQUE,
  institute_name text NOT NULL,
  owner_first_name text NOT NULL,
  owner_last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  mobile text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  institute_type text DEFAULT 'Tutorial',
  logo_url text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tenants_registry" ON public.tenants_registry FOR ALL USING (true) WITH CHECK (true);

-- Tenant admin credentials (auto-created on onboarding)
CREATE TABLE public.tenant_admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_registry_id uuid NOT NULL REFERENCES public.tenants_registry(id) ON DELETE CASCADE,
  email text NOT NULL,
  temp_password text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_admin_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tenant_admin_credentials" ON public.tenant_admin_credentials FOR ALL USING (true) WITH CHECK (true);

-- Seed default platform admin
INSERT INTO public.platform_admins (first_name, last_name, email, mobile, password, role)
VALUES ('Arun Kumar', 'Kurapati', 'arunkumar.kurapati@gmail.com', '7549683977', 'Unique@7856', 'PLATFORM_ADMIN')
ON CONFLICT (email) DO NOTHING;
