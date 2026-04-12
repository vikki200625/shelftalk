<div align="center">

```
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░                                             ░
  ░    📚  S H E L F T A L K               ░
  ░    where books finally get a social life    ░
  ░                                             ░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

**Your TBR pile just got a glow-up.** 🥺🥺👉👈

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

[🚀 Live Demo](https://shelftalk-9g8sbd62z-vikki200625s-projects.vercel.app) · [✨ GitHub](https://github.com/vikki200625/shelftalk)

</div>

---

## 📖 What even is this?

You know that one friend who has read *everything*, remembers every plot twist, judges your taste (lovingly), and always has a recommendation ready at 2am?

**ShelfTalk is that friend. But it never sleeps and doesn't steal your snacks.**

It's a full-stack book social platform where you can track what you're reading, stalk your friends' shelves, join book clubs, get AI-powered recommendations, and finally find people who also cried at *that* chapter.

> *"I built this instead of finishing my reading list. The irony is not lost on me."*
> — the developer, probably

---

## ✨ Features (a.k.a. reasons to never touch Goodreads again)

### 📚 Your Personal Library
- **Browse & Search** — Powered by Google Books API. No more "uhh it had a blue cover" Google searches.
- **Reading Status Tracker** — *Want to Read / Reading / Completed / Dropped* (we don't judge the dropped ones. okay maybe a little.)
- **Book Lists** — Make curated collections. "Books I'll definitely read someday" is a valid list name.
- **Reading Goals** — Set yearly targets. Watch yourself fail in beautiful, animated progress bars.
- **Notes & Highlights** — Annotate books like the intellectual you aspire to be.

### 👯 Social (for the extroverted bookworm)
- **Friends System** — Search users, send friend requests, follow people with better taste than you.
- **Real-time Chat** — A live chatroom because group chats were getting too civilized.
- **Book Clubs** — Create genre-based clubs. Fantasy dragons. Cozy mysteries. Whatever your vibe is.
- **Discussions** — Argue about endings in a structured, civilized manner. (Spoiler tags included. You're welcome.)

### 🤖 The Smart Stuff
- **AI Recommendations** — Tell it your mood and it'll find your next obsession. Powered by actual AI, not a random number generator.
- **Dashboard & Stats** — Reading streaks, achievements, yearly progress. Gamification, but make it literary.
- **Dark Mode** — For the night owls reading at 3am claiming "just one more chapter."

### ⚡ The Nerdy Bits
- **PWA** — Install it on your phone. It lives in your home screen now. Cozy.
- **Fully Responsive** — Looks gorgeous on everything from a smartwatch to a cinema display. (okay maybe not a smartwatch)
- **Glassmorphism UI** — It's pretty. Like, embarrassingly pretty.

---

## 🛠️ Tech Stack

```
Frontend    →  React + Vite (fast. like, really fast.)
Styling     →  Tailwind CSS + Material Design 3 (pretty fast too)
Backend     →  Supabase (Postgres + Auth + Realtime + Storage)
Books API   →  Google Books API (Google knows every book. of course.)
AI          →  Because recommending "just read more" wasn't enough
Deployment  →  Vercel (it just works™)
```

---

## 🚀 Running it Locally

*(For the brave souls who want to poke around)*

**Prerequisites:** Node.js 18+, a Supabase account, and the will to live.

```bash
# 1. Clone it
git clone https://github.com/vikki200625/shelftalk.git
cd shelftalk

# 2. Install stuff
npm install

# 3. Set up your secrets
cp .env.example .env
# Fill in your Supabase URL, anon key, and Google Books API key
# (yes you need to make a .env file. no I won't do it for you.)

# 4. Set up the database
# Run migration_00_fix_rls.sql first (if you get white screen)
# Then run migrations 01-07 in order

# 5. Run it
npm run dev
```

Open `http://localhost:5173` and behold. ✨

---

## 🗄️ Database Setup

Head to your Supabase SQL Editor and run the migration files **in order**:

| File | What it does |
|------|-------------|
| `migration_00_fix_rls.sql` | Fixes RLS policies (run first if white screen) |
| `migration_01_reading_goals.sql` | Reading goals |
| `migration_02_user_follows.sql` | Follow system |
| `migration_03_book_lists.sql` | Book lists/collections |
| `migration_04_chat.sql` | Chat messages |
| `migration_05_book_clubs.sql` | Book clubs & discussions |
| `migration_06_analytics.sql` | Reading streaks, achievements |
| `migration_07_notes.sql` | Notes & highlights |

---

## 🌍 Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

---

## 🤝 Contributing

Found a bug? Have a feature idea? Think the color scheme could be better?

1. Fork it
2. Create a branch (`git checkout -b feature/actually-good-idea`)
3. Commit your changes (`git commit -m 'Add: that thing you wanted'`)
4. Push (`git push origin feature/actually-good-idea`)
5. Open a PR and describe what you did like I'm five

PRs are welcome. Unsolicited redesigns of the entire frontend are... also welcome, honestly.

---

## 🐛 Known Issues

- The TBR pile grows faster than the "Completed" list. *This is a feature.*
- AI recommendations are dangerously good. Side effects include: buying 7 new books, crying, and missing sleep.
- Real-time chat may cause you to make actual friends. We accept no liability.

---

## 📜 License

MIT — meaning yes, you can use this, and no, you don't have to credit me.
But like... it would be nice. Just saying. 👉👈

---

<div align="center">

**Made with 📚 + ☕ + one too many late nights**

*If this project made you smile, go read a book.*
*If this project frustrated you, also go read a book.*
*Books fix everything.*

---

⭐ **Star this repo if you believe physical books and e-books can coexist peacefully** ⭐

</div>