-- ============================================
-- STEP 2: USER FOLLOWS
-- ============================================

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "follows_select" ON public.user_follows;
CREATE POLICY "follows_select" ON public.user_follows FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "follows_insert" ON public.user_follows;
CREATE POLICY "follows_insert" ON public.user_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete" ON public.user_follows;
CREATE POLICY "follows_delete" ON public.user_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);