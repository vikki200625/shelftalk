-- Version 1.1 Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- Reading Progress Tracking
-- ============================================

-- Add page_count to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS page_count integer;

-- Add progress tracking columns to user_library
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS current_page integer DEFAULT 0;
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS finished_at timestamptz;

-- ============================================
-- Spoiler Support
-- ============================================

-- Add spoiler flags to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_spoiler boolean DEFAULT false;

-- Add spoiler flags to discussions
ALTER TABLE public.discussions ADD COLUMN IF NOT EXISTS is_spoiler boolean DEFAULT false;

-- Add spoiler flags to replies
ALTER TABLE public.discussion_replies ADD COLUMN IF NOT EXISTS is_spoiler boolean DEFAULT false;
