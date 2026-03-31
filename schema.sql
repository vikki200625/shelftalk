-- ============================================
-- ShelfTalk Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- ============================================
-- 2. BOOKS TABLE
-- ============================================
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  open_library_key text unique not null,
  title text not null,
  author text,
  isbn text,
  description text,
  cover_url text,
  publish_year integer,
  subjects text[],
  created_at timestamptz default now() not null
);

-- ============================================
-- 3. USER_LIBRARY TABLE
-- ============================================
create type reading_status as enum ('want_to_read', 'reading', 'completed', 'dropped');

create table public.user_library (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,
  status reading_status default 'want_to_read',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, book_id)
);

-- ============================================
-- 4. REVIEWS TABLE
-- ============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id uuid references public.books(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  body text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, book_id)
);

-- ============================================
-- 5. DISCUSSIONS TABLE
-- ============================================
create table public.discussions (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text,
  created_at timestamptz default now() not null
);

-- ============================================
-- 6. DISCUSSION_REPLIES TABLE
-- ============================================
create table public.discussion_replies (
  id uuid default uuid_generate_v4() primary key,
  discussion_id uuid references public.discussions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_books_open_library_key on public.books (open_library_key);
create index idx_user_library_user on public.user_library (user_id);
create index idx_user_library_book on public.user_library (book_id);
create index idx_reviews_book on public.reviews (book_id);
create index idx_reviews_user on public.reviews (user_id);
create index idx_discussions_book on public.discussions (book_id);
create index idx_replies_discussion on public.discussion_replies (discussion_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.user_library enable row level security;
alter table public.reviews enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_replies enable row level security;

-- PROFILES policies
create policy "Anyone can view profiles"
on public.profiles for select to authenticated, anon using (true);

create policy "Users can update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- BOOKS policies
create policy "Anyone can view books"
on public.books for select to authenticated, anon using (true);

create policy "Authenticated users can add books"
on public.books for insert to authenticated with check (true);

-- USER_LIBRARY policies
create policy "Users can view own library"
on public.user_library for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can add to own library"
on public.user_library for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own library"
on public.user_library for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can remove from own library"
on public.user_library for delete to authenticated
using ((select auth.uid()) = user_id);

-- REVIEWS policies
create policy "Anyone can view reviews"
on public.reviews for select to authenticated, anon using (true);

create policy "Users can create reviews"
on public.reviews for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own reviews"
on public.reviews for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own reviews"
on public.reviews for delete to authenticated
using ((select auth.uid()) = user_id);

-- DISCUSSIONS policies
create policy "Anyone can view discussions"
on public.discussions for select to authenticated, anon using (true);

create policy "Users can create discussions"
on public.discussions for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own discussions"
on public.discussions for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own discussions"
on public.discussions for delete to authenticated
using ((select auth.uid()) = user_id);

-- DISCUSSION_REPLIES policies
create policy "Anyone can view replies"
on public.discussion_replies for select to authenticated, anon using (true);

create policy "Users can create replies"
on public.discussion_replies for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own replies"
on public.discussion_replies for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own replies"
on public.discussion_replies for delete to authenticated
using ((select auth.uid()) = user_id);
