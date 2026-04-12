-- Reading Analytics Table
-- Track reading progress, streaks, and achievements

CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  pages_read INTEGER DEFAULT 0,
  minutes_read INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  requirement INTEGER,
  type TEXT CHECK (type IN ('books', 'pages', 'streak', 'reviews', 'discussions'))
);

-- User Achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id INTEGER REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Reading Streaks
CREATE TABLE IF NOT EXISTS public.reading_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON public.reading_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_streaks_user ON public.reading_streaks(user_id);

-- Enable RLS
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_streaks ENABLE ROW LEVEL SECURITY;

-- Default Achievements Data
INSERT INTO public.achievements (name, description, icon, requirement, type) VALUES
  ('First Book', 'Completed your first book', '📖', 1, 'books'),
  ('Bookworm', 'Completed 10 books', '📚', 10, 'books'),
  ('Bibliophile', 'Completed 50 books', '🏛️', 50, 'books'),
  ('Book Master', 'Completed 100 books', '👑', 100, 'books'),
  ('Page Turner', 'Read 100 pages', '📄', 100, 'pages'),
  ('Chapter Champion', 'Read 1000 pages', '📑', 1000, 'pages'),
  ('Page Master', 'Read 10000 pages', '📖', 10000, 'pages'),
  ('Streak Starter', '3 day reading streak', '🔥', 3, 'streak'),
  ('On Fire', '7 day reading streak', '🔥🔥', 7, 'streak'),
  ('Unstoppable', '30 day reading streak', '🔥🔥🔥', 30, 'streak'),
  ('First Review', 'Wrote your first review', '✍️', 1, 'reviews'),
  ('Critic', 'Wrote 10 reviews', '📝', 10, 'reviews'),
  ('Discussion Starter', 'Started 5 discussions', '💬', 5, 'discussions')
ON CONFLICT (name) DO NOTHING;

-- Policies for reading_sessions
CREATE POLICY "Users can view own reading sessions"
  ON public.reading_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading sessions"
  ON public.reading_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading sessions"
  ON public.reading_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for user_achievements
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for reading_streaks
CREATE POLICY "Users can view own streaks"
  ON public.reading_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.reading_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.reading_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);