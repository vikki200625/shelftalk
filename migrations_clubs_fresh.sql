-- Fresh clubs table creation
DROP TABLE IF EXISTS public.book_clubs CASCADE;
DROP TABLE IF EXISTS public.book_club_members CASCADE;

CREATE TABLE public.book_clubs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  cover_type text DEFAULT 'fantasy',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE public.book_club_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id uuid REFERENCES public.book_clubs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Simple RLS - allow all authenticated users full access
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated can do everything on clubs" ON public.book_clubs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "All authenticated can do everything on members" ON public.book_club_members FOR ALL TO authenticated USING (true) WITH CHECK (true);