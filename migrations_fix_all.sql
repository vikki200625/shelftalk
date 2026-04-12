-- Fix all tables at once

-- Enable RLS on all tables and give full access to authenticated users
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;

-- Drop old policies and add simple ones
DROP POLICY IF EXISTS "allow_all_books" ON public.books;
CREATE POLICY "allow_all_books" ON public.books FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_library" ON public.user_library;
CREATE POLICY "allow_all_library" ON public.user_library FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_reviews" ON public.reviews;
CREATE POLICY "allow_all_reviews" ON public.reviews FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_discussions" ON public.discussions;
CREATE POLICY "allow_all_discussions" ON public.discussions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_goals" ON public.reading_goals;
CREATE POLICY "allow_all_goals" ON public.reading_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_clubs" ON public.book_clubs;
CREATE POLICY "allow_all_clubs" ON public.book_clubs FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_club_members" ON public.book_club_members;
CREATE POLICY "allow_all_club_members" ON public.book_club_members FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);