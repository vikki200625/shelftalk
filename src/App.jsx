import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Browse from './pages/Browse'
import SearchResults from './pages/SearchResults'
import BookDetails from './pages/BookDetails'
import MyLibrary from './pages/MyLibrary'
import BookLists from './pages/BookLists'
import BookListDetail from './pages/BookListDetail'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import Friends from './pages/Friends'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <Toast />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/library" element={<MyLibrary />} />
          <Route path="/lists" element={<BookLists />} />
          <Route path="/lists/:id" element={<BookListDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
