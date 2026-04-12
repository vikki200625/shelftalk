-- ============================================
-- STEP 1: READING GOALS
-- ============================================

-- Add notes column (if not exists)
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS notes text;

-- Create reading_goals table
CREATE TABLE IF NOT EXISTS public.reading_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  target integer NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "goals_select" ON public.reading_goals;
CREATE POLICY "goals_select" ON public.reading_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_insert" ON public.reading_goals;
CREATE POLICY "goals_insert" ON public.reading_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_update" ON public.reading_goals;
CREATE POLICY "goals_update" ON public.reading_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_delete" ON public.reading_goals;
CREATE POLICY "goals_delete" ON public.reading_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);