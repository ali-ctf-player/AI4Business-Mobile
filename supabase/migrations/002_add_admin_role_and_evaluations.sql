-- =============================================================================
-- SES (Startup Ecosystem Support) – Migration 002
-- Add admin role, startup evaluations, jury scoring, and icon_url for hackathons
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add 'admin' role
-- -----------------------------------------------------------------------------
INSERT INTO public.roles (slug, name) VALUES
  ('admin', 'Admin')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Add icon_url column to hackathons (if not exists)
-- -----------------------------------------------------------------------------
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'hackathons' 
    AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE public.hackathons ADD COLUMN icon_url text;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. STARTUP EVALUATIONS (jury və ekspert dəyərləndirmələri)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startup_evaluations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id  uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  hackathon_id uuid REFERENCES public.hackathons(id) ON DELETE SET NULL,
  evaluator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluator_type text NOT NULL DEFAULT 'jury', -- 'jury' | 'expert'
  -- Qiymətləndirmə kriteriyaları (1-10 arası)
  innovation_score numeric(3,1) CHECK (innovation_score >= 0 AND innovation_score <= 10),
  market_potential_score numeric(3,1) CHECK (market_potential_score >= 0 AND market_potential_score <= 10),
  technical_score numeric(3,1) CHECK (technical_score >= 0 AND technical_score <= 10),
  presentation_score numeric(3,1) CHECK (presentation_score >= 0 AND presentation_score <= 10),
  business_model_score numeric(3,1) CHECK (business_model_score >= 0 AND business_model_score <= 10),
  -- Ümumi qiymət və şərhlər
  total_score numeric(5,2), -- Ümumi ortalama
  comments text,
  -- Status
  status text NOT NULL DEFAULT 'draft', -- 'draft' | 'submitted' | 'final'
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(startup_id, hackathon_id, evaluator_id) -- Hər evaluator hər hackathon üçün bir dəfə qiymətləndirə bilər
);

-- Trigger: total_score-i avtomatik hesabla
CREATE OR REPLACE FUNCTION public.calculate_total_score()
RETURNS trigger AS $$
BEGIN
  NEW.total_score = (
    COALESCE(NEW.innovation_score, 0) +
    COALESCE(NEW.market_potential_score, 0) +
    COALESCE(NEW.technical_score, 0) +
    COALESCE(NEW.presentation_score, 0) +
    COALESCE(NEW.business_model_score, 0)
  ) / 5.0;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_evaluation_score
  BEFORE INSERT OR UPDATE ON public.startup_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_total_score();

-- -----------------------------------------------------------------------------
-- 4. JURY MEMBERS (hackathon üzrə münsiflər)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jury_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'jury', -- 'jury' | 'head_jury' | 'expert'
  created_at  timestamptz DEFAULT now(),
  UNIQUE(hackathon_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 5. HACKATHON AWARDS (mükafatlar və yerlər)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hackathon_awards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  startup_id  uuid NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  team_id     uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  award_type  text NOT NULL, -- 'first_place' | 'second_place' | 'third_place' | 'best_innovation' | 'best_presentation' | 'special'
  award_name  text NOT NULL, -- Mükafatın adı (məs: "1-ci yer", "Ən yaxşı innovasiya")
  prize_amount numeric(10,2), -- Mükafat məbləği (məs: 10000.00)
  prize_description text,
  awarded_at  timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.startup_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jury_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_awards ENABLE ROW LEVEL SECURITY;

-- Startup evaluations: read for authenticated; write for evaluator, admin, super_admin
CREATE POLICY "startup_evaluations_select" ON public.startup_evaluations 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "startup_evaluations_insert" ON public.startup_evaluations 
  FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = evaluator_id 
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );
CREATE POLICY "startup_evaluations_update" ON public.startup_evaluations 
  FOR UPDATE TO authenticated 
  USING (
    auth.uid() = evaluator_id 
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );
CREATE POLICY "startup_evaluations_delete" ON public.startup_evaluations 
  FOR DELETE TO authenticated 
  USING (
    auth.uid() = evaluator_id 
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );

-- Jury members: read for authenticated; write for admin, super_admin
CREATE POLICY "jury_members_select" ON public.jury_members 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "jury_members_insert" ON public.jury_members 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );
CREATE POLICY "jury_members_update" ON public.jury_members 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );
CREATE POLICY "jury_members_delete" ON public.jury_members 
  FOR DELETE TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );

-- Hackathon awards: read for authenticated; write for admin, super_admin
CREATE POLICY "hackathon_awards_select" ON public.hackathon_awards 
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "hackathon_awards_insert" ON public.hackathon_awards 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );
CREATE POLICY "hackathon_awards_update" ON public.hackathon_awards 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );
CREATE POLICY "hackathon_awards_delete" ON public.hackathon_awards 
  FOR DELETE TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin')))
  );

-- -----------------------------------------------------------------------------
-- Update existing policies to include admin role
-- -----------------------------------------------------------------------------

-- Hackathons: admin can also manage
DROP POLICY IF EXISTS "hackathons_insert" ON public.hackathons;
DROP POLICY IF EXISTS "hackathons_update" ON public.hackathons;
DROP POLICY IF EXISTS "hackathons_delete" ON public.hackathons;

CREATE POLICY "hackathons_insert" ON public.hackathons FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );
CREATE POLICY "hackathons_update" ON public.hackathons FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );
CREATE POLICY "hackathons_delete" ON public.hackathons FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );

-- Startups: admin can also manage
DROP POLICY IF EXISTS "startups_update" ON public.startups;
DROP POLICY IF EXISTS "startups_delete" ON public.startups;

CREATE POLICY "startups_update" ON public.startups FOR UPDATE TO authenticated
  USING (
    auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );
CREATE POLICY "startups_delete" ON public.startups FOR DELETE TO authenticated
  USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );

-- IT hubs: admin can also manage
DROP POLICY IF EXISTS "it_hubs_insert" ON public.it_hubs;
DROP POLICY IF EXISTS "it_hubs_update" ON public.it_hubs;
DROP POLICY IF EXISTS "it_hubs_delete" ON public.it_hubs;

CREATE POLICY "it_hubs_insert" ON public.it_hubs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );
CREATE POLICY "it_hubs_update" ON public.it_hubs FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );
CREATE POLICY "it_hubs_delete" ON public.it_hubs FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.role_id IN (SELECT id FROM public.roles WHERE slug IN ('admin', 'super_admin'))
    )
  );

-- -----------------------------------------------------------------------------
-- INDEXES (performance)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_startup_evaluations_startup_id ON public.startup_evaluations(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_evaluations_hackathon_id ON public.startup_evaluations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_startup_evaluations_evaluator_id ON public.startup_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_jury_members_hackathon_id ON public.jury_members(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_jury_members_user_id ON public.jury_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_awards_hackathon_id ON public.hackathon_awards(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_hackathon_awards_startup_id ON public.hackathon_awards(startup_id);
