-- ============================================
-- STEP 0: FIX RLS ON EXISTING TABLES
-- ============================================
-- Run this FIRST if you have white screen issues

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Full access policies for authenticated users
DROP POLICY IF EXISTS "books_full" ON public.books;
CREATE POLICY "books_full" ON public.books FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "library_full" ON public.user_library;
CREATE POLICY "library_full" ON public.user_library FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_full" ON public.profiles;
CREATE POLICY "profiles_full" ON public.profiles FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "reviews_full" ON public.reviews;
CREATE POLICY "reviews_full" ON public.reviews FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "discussions_full" ON public.discussions;
CREATE POLICY "discussions_full" ON public.discussions FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "replies_full" ON public.discussion_replies;
CREATE POLICY "replies_full" ON public.discussion_replies FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "goals_full" ON public.reading_goals;
CREATE POLICY "goals_full" ON public.reading_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "follows_full" ON public.user_follows;
CREATE POLICY "follows_full" ON public.user_follows FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lists_full" ON public.book_lists;
CREATE POLICY "lists_full" ON public.book_lists FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "list_items_full" ON public.book_list_items;
CREATE POLICY "list_items_full" ON public.book_list_items FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "messages_full" ON public.messages;
CREATE POLICY "messages_full" ON public.messages FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);