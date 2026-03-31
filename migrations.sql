-- Migration: Add notes and reading_goal fields
-- Run this in Supabase SQL Editor

-- Add notes column to user_library
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS notes text;

-- Create reading_goals table
CREATE TABLE IF NOT EXISTS public.reading_goals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  target integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, year)
);

-- Enable RLS on reading_goals
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for reading_goals
CREATE POLICY IF NOT EXISTS "Users can view own goals"
ON public.reading_goals FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own goals"
ON public.reading_goals FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own goals"
ON public.reading_goals FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own goals"
ON public.reading_goals FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Create user_follows table for follow system
CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_follows
CREATE POLICY IF NOT EXISTS "Anyone can view follows"
ON public.user_follows FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY IF NOT EXISTS "Users can follow others"
ON public.user_follows FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = follower_id);

CREATE POLICY IF NOT EXISTS "Users can unfollow"
ON public.user_follows FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = follower_id);

-- Create book_lists table for collections
CREATE TABLE IF NOT EXISTS public.book_lists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create book_list_items table
CREATE TABLE IF NOT EXISTS public.book_list_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  list_id uuid REFERENCES public.book_lists(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  added_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(list_id, book_id)
);

-- Enable RLS on book_lists
ALTER TABLE public.book_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view public lists"
ON public.book_lists FOR SELECT TO authenticated, anon
USING (is_public = true OR (SELECT auth.uid()) = user_id);

CREATE POLICY IF NOT EXISTS "Users can create own lists"
ON public.book_lists FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own lists"
ON public.book_lists FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own lists"
ON public.book_lists FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Enable RLS on book_list_items
ALTER TABLE public.book_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can view list items for public lists"
ON public.book_list_items FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY IF NOT EXISTS "Users can add to own lists"
ON public.book_list_items FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = (SELECT user_id FROM book_lists WHERE id = list_id));

CREATE POLICY IF NOT EXISTS "Users can remove from own lists"
ON public.book_list_items FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = (SELECT user_id FROM book_lists WHERE id = list_id));
