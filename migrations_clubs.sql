-- Book Clubs System

-- Book Clubs Table
CREATE TABLE IF NOT EXISTS public.book_clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_type TEXT DEFAULT 'fantasy',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  current_book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club Members
CREATE TABLE IF NOT EXISTS public.book_club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Club Discussions
CREATE TABLE IF NOT EXISTS public.club_discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS public.club_discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES public.club_discussions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_club_members ON public.book_club_members(club_id, user_id);
CREATE INDEX IF NOT EXISTS idx_club_discussions ON public.book_club_discussions(club_id);

-- Enable RLS
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_discussion_replies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view clubs" ON public.book_clubs FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users can create clubs" ON public.book_clubs FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update clubs" ON public.book_clubs FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Members can view members" ON public.book_club_members FOR SELECT USING (true);
CREATE POLICY "Users can join clubs" ON public.book_club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave" ON public.book_club_members FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Members can view discussions" ON public.club_discussions FOR SELECT USING (true);
CREATE POLICY "Members can create discussions" ON public.club_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view replies" ON public.club_discussion_replies FOR SELECT USING (true);
CREATE POLICY "Members can create replies" ON public.club_discussion_replies FOR INSERT WITH CHECK (auth.uid() = user_id);