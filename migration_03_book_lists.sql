-- ============================================
-- STEP 3: BOOK LISTS
-- ============================================

-- Create book_lists table
CREATE TABLE IF NOT EXISTS public.book_lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create book_list_items table
CREATE TABLE IF NOT EXISTS public.book_list_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid REFERENCES public.book_lists(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT NOW(),
  UNIQUE(list_id, book_id)
);

-- Enable RLS
ALTER TABLE public.book_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for book_lists
DROP POLICY IF EXISTS "lists_select" ON public.book_lists;
CREATE POLICY "lists_select" ON public.book_lists FOR SELECT TO authenticated, anon USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "lists_insert" ON public.book_lists;
CREATE POLICY "lists_insert" ON public.book_lists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lists_update" ON public.book_lists;
CREATE POLICY "lists_update" ON public.book_lists FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lists_delete" ON public.book_lists;
CREATE POLICY "lists_delete" ON public.book_lists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Policies for book_list_items
DROP POLICY IF EXISTS "list_items_select" ON public.book_list_items;
CREATE POLICY "list_items_select" ON public.book_list_items FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "list_items_insert" ON public.book_list_items;
CREATE POLICY "list_items_insert" ON public.book_list_items FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "list_items_delete" ON public.book_list_items;
CREATE POLICY "list_items_delete" ON public.book_list_items FOR DELETE TO authenticated USING (true);