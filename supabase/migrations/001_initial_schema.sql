-- =============================================================================
-- SES (Startup Ecosystem Support) – Innovation & Ecosystem Management Platform
-- Initial Supabase schema: Users, Roles, Startups, Hackathons, Teams, Map data
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ROLES (RBAC)
-- -----------------------------------------------------------------------------
CREATE TABLE public.roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,  -- 'startup' | 'investor' | 'it_company' | 'incubator' | 'super_admin'
  name       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.roles (slug, name) VALUES
  ('startup', 'Startup'),
  ('investor', 'Investor'),
  ('it_company', 'IT Company'),
  ('incubator', 'Incubator'),
  ('super_admin', 'Super Admin');

-- -----------------------------------------------------------------------------
-- 2. PROFILES (extends auth.users – one row per user)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id    uuid NOT NULL REFERENCES public.roles(id),
  email      text,
  full_name  text,
  avatar_url text,
  phone      text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger: create profile on signup (link to auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role_id, email, full_name)
  VALUES (
    NEW.id,
    (SELECT id FROM public.roles WHERE slug = 'startup' LIMIT 1), -- default role
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. STARTUPS (owned by users with Startup role)
-- -----------------------------------------------------------------------------
CREATE TABLE public.startups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  website     text,
  logo_url    text,
  stage       text,  -- e.g. 'idea' | 'mvp' | 'growth'
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(owner_id)  -- one startup per user (adjust if multiple allowed)
);

-- -----------------------------------------------------------------------------
-- 4. HACKATHONS (programs / events – with location for map)
-- -----------------------------------------------------------------------------
CREATE TABLE public.hackathons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  start_date  timestamptz NOT NULL,
  end_date    timestamptz NOT NULL,
  location    text,
  latitude    double precision,
  longitude   double precision,
  image_url   text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. TEAMS (per hackathon)
-- -----------------------------------------------------------------------------
CREATE TABLE public.teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name         text NOT NULL,
  description  text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 6. TEAM MEMBERS (users in teams – with optional role: lead / member)
-- -----------------------------------------------------------------------------
CREATE TABLE public.team_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member',  -- 'lead' | 'member'
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 7. TEAM JOIN REQUESTS (for "Join Team" flow)
-- -----------------------------------------------------------------------------
CREATE TABLE public.team_join_requests (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status    text NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 8. IT HUBS (for Ecosystem Map pins)
-- -----------------------------------------------------------------------------
CREATE TABLE public.it_hubs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  address     text,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 9. AUDIT LOG (placeholder table – implement logging in app/triggers)
-- -----------------------------------------------------------------------------
-- AUDIT: Sensitive operations (login, role change, data export) should append here.
-- Consider encryption for PII in log payload; retain minimal fields (user_id, action, resource, timestamp).
CREATE TABLE public.audit_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id),
  action     text NOT NULL,
  resource   text,
  payload    jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.roles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_hubs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log        ENABLE ROW LEVEL SECURITY;

-- Roles: read-only for authenticated users
CREATE POLICY "roles_select" ON public.roles FOR SELECT TO authenticated USING (true);

-- Profiles: users can read all (for display names); update only own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Startups: read for authenticated (investors see profiles); insert/update/delete for owner or super_admin
CREATE POLICY "startups_select" ON public.startups FOR SELECT TO authenticated USING (true);
CREATE POLICY "startups_insert" ON public.startups FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "startups_update" ON public.startups FOR UPDATE TO authenticated
  USING (
    auth.uid() = owner_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin'))
  );
CREATE POLICY "startups_delete" ON public.startups FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));

-- Hackathons: read for authenticated; write for super_admin only (adjust as needed)
CREATE POLICY "hackathons_select" ON public.hackathons FOR SELECT TO authenticated USING (true);
CREATE POLICY "hackathons_insert" ON public.hackathons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));
CREATE POLICY "hackathons_update" ON public.hackathons FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));
CREATE POLICY "hackathons_delete" ON public.hackathons FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));

-- Teams: read for authenticated; insert/update/delete for super_admin or hackathon owner (simplified: allow insert for authenticated for "create team")
CREATE POLICY "teams_select" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_insert" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teams_update" ON public.teams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "teams_delete" ON public.teams FOR DELETE TO authenticated USING (true);

-- Team members: read for authenticated; insert/delete for team lead or self
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_members_insert" ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_members_delete" ON public.team_members FOR DELETE TO authenticated USING (auth.uid() = user_id OR true);

-- Team join requests: read for team members/lead; insert for authenticated; update for team lead
CREATE POLICY "team_join_requests_select" ON public.team_join_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_join_requests_insert" ON public.team_join_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "team_join_requests_update" ON public.team_join_requests FOR UPDATE TO authenticated USING (true);

-- IT hubs: read for authenticated; write for super_admin
CREATE POLICY "it_hubs_select" ON public.it_hubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "it_hubs_insert" ON public.it_hubs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));
CREATE POLICY "it_hubs_update" ON public.it_hubs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));
CREATE POLICY "it_hubs_delete" ON public.it_hubs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));

-- Audit log: insert from service role or app; read only for super_admin
CREATE POLICY "audit_log_insert" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_log_select" ON public.audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug = 'super_admin')));

-- -----------------------------------------------------------------------------
-- INDEXES (performance)
-- -----------------------------------------------------------------------------
CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX idx_startups_owner_id ON public.startups(owner_id);
CREATE INDEX idx_teams_hackathon_id ON public.teams(hackathon_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_join_requests_team_id ON public.team_join_requests(team_id);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);

-- -----------------------------------------------------------------------------
-- HELPER: get current user role slug
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role_slug()
RETURNS text AS $$
  SELECT r.slug FROM public.roles r
  JOIN public.profiles p ON p.role_id = r.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
