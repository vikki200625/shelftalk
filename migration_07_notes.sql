-- ============================================
-- STEP 7: NOTES & HIGHLIGHTS
-- ============================================

-- Add columns to user_library (if not exists)
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS favorite_quote TEXT;

-- Create book_notes table
CREATE TABLE IF NOT EXISTS public.book_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  is_highlight BOOLEAN DEFAULT FALSE,
  created_at timestamptz DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_book_notes_book ON public.book_notes (book_id);

-- Policies
DROP POLICY IF EXISTS "notes_select" ON public.book_notes;
CREATE POLICY "notes_select" ON public.book_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_insert" ON public.book_notes;
CREATE POLICY "notes_insert" ON public.book_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_update" ON public.book_notes;
CREATE POLICY "notes_update" ON public.book_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_delete" ON public.book_notes;
CREATE POLICY "notes_delete" ON public.book_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);