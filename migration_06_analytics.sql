-- ============================================
-- STEP 6: ANALYTICS (Reading Sessions, Streaks, Achievements)
-- ============================================

-- Create reading_sessions table
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  pages_read integer DEFAULT 0,
  minutes_read integer DEFAULT 0,
  started_at timestamptz DEFAULT NOW(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  requirement integer,
  type text
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id integer REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create reading_streaks table
CREATE TABLE IF NOT EXISTS public.reading_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_read_date date,
  updated_at timestamptz DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, requirement, type) VALUES
  ('First Book', 'Completed your first book', '📖', 1, 'books'),
  ('Bookworm', 'Completed 10 books', '📚', 10, 'books'),
  ('Bibliophile', 'Completed 50 books', '🏛️', 50, 'books'),
  ('Page Turner', 'Read 100 pages', '📄', 100, 'pages'),
  ('Streak Starter', '3 day reading streak', '🔥', 3, 'streak'),
  ('On Fire', '7 day reading streak', '🔥🔥', 7, 'streak')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_streaks ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON public.reading_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.reading_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.user_achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON public.reading_streaks (user_id);

-- Policies
DROP POLICY IF EXISTS "sessions_select" ON public.reading_sessions;
CREATE POLICY "sessions_select" ON public.reading_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_insert" ON public.reading_sessions;
CREATE POLICY "sessions_insert" ON public.reading_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "achievements_select" ON public.achievements;
CREATE POLICY "achievements_select" ON public.achievements FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "user_achievements_select" ON public.user_achievements;
CREATE POLICY "user_achievements_select" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_achievements_insert" ON public.user_achievements;
CREATE POLICY "user_achievements_insert" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_select" ON public.reading_streaks;
CREATE POLICY "streaks_select" ON public.reading_streaks FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_insert" ON public.reading_streaks;
CREATE POLICY "streaks_insert" ON public.reading_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_update" ON public.reading_streaks;
CREATE POLICY "streaks_update" ON public.reading_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id);