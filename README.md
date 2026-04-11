# ShelfTalk 📚

<div align="center">

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-3-green?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-yellow)

*A modern book discovery platform for tracking your reading journey*

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Book Discovery** | Explore millions of books via Google Books API with category & author browsing |
| 📖 **Personal Library** | Track reading progress, manage collections, set reading goals |
| ⭐ **Reviews & Ratings** | Rate books and share your thoughts with the community |
| 💬 **Discussions** | Start conversations, reply to readers, mark spoilers |
| 👥 **Social** | Follow readers, get personalized recommendations |
| 🌙 **Dark Mode** | Beautiful theme that follows your system preference |
| ✨ **Polished UX** | Toast notifications, loading skeletons, empty states |

---

## 🛠 Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  React 18 • Vite • Tailwind CSS • React Router    │
├─────────────────────────────────────────────────────┤
│                     Backend                         │
│  Supabase (PostgreSQL, Auth, RLS, Realtime)       │
├─────────────────────────────────────────────────────┤
│                      APIs                           │
│  Google Books API • Open Library                   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone & install
git clone https://github.com/vikki200625/shelftalk.git
cd shelftalk
npm install

# Set up environment
cp .env.example .env
# Add your Supabase URL, Anon Key, and Google Books API key

# Run
npm run dev
```

---

## 📁 Project Structure

```
shelftalk/
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (Auth, Theme, Toast)
│   ├── lib/           # API integrations
│   └── pages/         # Route pages
├── migrations*.sql    # Database schemas
├── .env               # Environment variables
└── package.json
```

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_GOOGLE_BOOKS_API_KEY` | Google Books API key |

---

## 📄 License

MIT License • Feel free to use this for your portfolio!

---

<div align="center">

**Made with ☕ and too many books**

</div>