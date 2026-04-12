-- ============================================
-- STEP 5: BOOK CLUBS
-- ============================================

-- Drop existing tables if they exist (safe to run)
DROP TABLE IF EXISTS public.club_discussion_replies CASCADE;
DROP TABLE IF EXISTS public.club_discussions CASCADE;
DROP TABLE IF EXISTS public.book_club_members CASCADE;
DROP TABLE IF EXISTS public.book_clubs CASCADE;

-- Create book_clubs table
CREATE TABLE public.book_clubs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  cover_type text DEFAULT 'fantasy',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT NOW()
);

-- Create book_club_members table
CREATE TABLE public.book_club_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id uuid REFERENCES public.book_clubs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Create club_discussions table
CREATE TABLE public.club_discussions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id uuid REFERENCES public.book_clubs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Create club_discussion_replies table
CREATE TABLE public.club_discussion_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id uuid REFERENCES public.club_discussions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  body text NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_club_members ON public.book_club_members (club_id, user_id);
CREATE INDEX IF NOT EXISTS idx_club_discussions ON public.club_discussions (club_id);

-- Enable RLS
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_discussion_replies ENABLE ROW LEVEL SECURITY;

-- Policies for book_clubs
DROP POLICY IF EXISTS "clubs_select" ON public.book_clubs;
CREATE POLICY "clubs_select" ON public.book_clubs FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "clubs_insert" ON public.book_clubs;
CREATE POLICY "clubs_insert" ON public.book_clubs FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "clubs_update" ON public.book_clubs;
CREATE POLICY "clubs_update" ON public.book_clubs FOR UPDATE TO authenticated USING (auth.uid() = created_by);

-- Policies for book_club_members
DROP POLICY IF EXISTS "members_select" ON public.book_club_members;
CREATE POLICY "members_select" ON public.book_club_members FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "members_insert" ON public.book_club_members;
CREATE POLICY "members_insert" ON public.book_club_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "members_delete" ON public.book_club_members;
CREATE POLICY "members_delete" ON public.book_club_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for club_discussions
DROP POLICY IF EXISTS "discussions_select" ON public.club_discussions;
CREATE POLICY "discussions_select" ON public.club_discussions FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "discussions_insert" ON public.club_discussions;
CREATE POLICY "discussions_insert" ON public.club_discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policies for club_discussion_replies
DROP POLICY IF EXISTS "replies_select" ON public.club_discussion_replies;
CREATE POLICY "replies_select" ON public.club_discussion_replies FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "replies_insert" ON public.club_discussion_replies;
CREATE POLICY "replies_insert" ON public.club_discussion_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);