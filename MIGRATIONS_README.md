# ShelfTalk Database Migrations

Run these in Supabase SQL Editor in numerical order (00 → 07).

## Quick Fix (if white screen)
If you're getting a white blank screen, start with:
```sql
-- migration_00_fix_rls.sql (copy-paste the entire file content)
```

## New Features (fresh database)
Run in this exact order:

| Step | File | Description |
|------|------|-------------|
| 1 | `migration_01_reading_goals.sql` | Reading goals |
| 2 | `migration_02_user_follows.sql` | Follow system |
| 3 | `migration_03_book_lists.sql` | Book collections/lists |
| 4 | `migration_04_chat.sql` | Chat messages |
| 5 | `migration_05_book_clubs.sql` | Book clubs |
| 6 | `migration_06_analytics.sql` | Reading sessions, streaks, achievements |
| 7 | `migration_07_notes.sql` | Notes & highlights |

## How to Run

1. Go to: https://kaasrjpxexvowvxgdduq.supabase.com
2. Click **SQL Editor** in the left sidebar
3. Copy the entire content of a migration file
4. Paste into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Repeat for each file in order

## Troubleshooting

**White screen after running migrations?**
Run `migration_00_fix_rls.sql` again to fix all RLS policies.

**"Table already exists" errors?**
That's normal - the migrations use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times.