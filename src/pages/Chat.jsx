import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        fetchMessageWithProfile(payload.new.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(id, display_name, avatar_url)')
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) setMessages(data)
    setLoading(false)
  }

  async function fetchMessageWithProfile(messageId) {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(id, display_name, avatar_url)')
      .eq('id', messageId)
      .single()

    if (data) {
      setMessages(prev => [...prev, data])
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        body: newMessage.trim()
      })

    if (!error) {
      setNewMessage('')
    }
    setSending(false)
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Sign in to chat
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          You need to be logged in to participate in the chat.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Community Chat</h1>
      
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">No messages yet. Be the first to say something!</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.user_id === user.id ? 'flex-row-reverse' : ''}`}>
                {msg.profiles?.avatar_url ? (
                  <img 
                    src={msg.profiles.avatar_url} 
                    alt={msg.profiles.display_name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {getInitials(msg.profiles?.display_name)}
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.user_id === user.id ? 'text-right' : ''}`}>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {msg.profiles?.display_name || 'Unknown'} • {formatTime(msg.created_at)}
                  </div>
                  <div className={`inline-block px-3 py-2 rounded-lg ${
                    msg.user_id === user.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    {msg.body}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}