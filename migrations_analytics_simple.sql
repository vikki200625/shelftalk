-- Analytics tables (simplified)

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

CREATE TABLE IF NOT EXISTS public.achievements (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  requirement integer,
  type text
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id integer REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.reading_streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_read_date date,
  updated_at timestamptz DEFAULT NOW()
);

-- Default achievements
INSERT INTO public.achievements (name, description, icon, requirement, type) VALUES
  ('First Book', 'Completed your first book', '📖', 1, 'books'),
  ('Bookworm', 'Completed 10 books', '📚', 10, 'books'),
  ('Bibliophile', 'Completed 50 books', '🏛️', 50, 'books'),
  ('Page Turner', 'Read 100 pages', '📄', 100, 'pages'),
  ('Streak Starter', '3 day reading streak', '🔥', 3, 'streak'),
  ('On Fire', '7 day reading streak', '🔥🔥', 7, 'streak')
ON CONFLICT (name) DO NOTHING;