-- Add notes to user_library if not exists
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS favorite_quote TEXT;

-- Create book notes table
CREATE TABLE IF NOT EXISTS public.book_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  is_highlight BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX IF NOT EXISTS idx_book_notes_book ON public.book_notes(book_id);

-- Policies
CREATE POLICY "Users can view own notes" ON public.book_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create notes" ON public.book_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update notes" ON public.book_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete notes" ON public.book_notes FOR DELETE USING (auth.uid() = user_id);