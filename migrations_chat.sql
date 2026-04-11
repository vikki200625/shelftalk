-- Chat Messages Table
-- Run this in Supabase SQL Editor

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null
);

-- Index for ordering messages
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can view messages
CREATE POLICY "Anyone can view messages"
ON public.messages FOR SELECT TO authenticated, anon USING (true);

-- Policy: authenticated users can insert messages
CREATE POLICY "Users can create messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

-- Note: Enable Realtime on this table in Supabase dashboard
-- Go to Database -> Tables -> messages -> Enable Realtime