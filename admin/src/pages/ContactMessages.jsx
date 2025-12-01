import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const ContactMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, unread: 0, spam: 0, today: 0 })
  const [filters, setFilters] = useState({
    read: '',
    spam: '',
    search: '',
    page: 1
  })
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchStats()
    fetchMessages()
  }, [filters])

  const fetchStats = async () => {
    try {
      const response = await api.get('/contact-messages/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.read) params.append('read', filters.read)
      if (filters.spam) params.append('spam', filters.spam)
      if (filters.search) params.append('search', filters.search)
      params.append('page', filters.page)
      params.append('limit', '20')

      const response = await api.get(`/contact-messages?${params.toString()}`)
      setMessages(response.data.messages)
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/contact-messages/${id}/read`)
      toast.success('Marked as read')
      fetchMessages()
      fetchStats()
    } catch (error) {
      toast.error('Failed to update message')
    }
  }

  const handleMarkAsSpam = async (id) => {
    try {
      await api.put(`/contact-messages/${id}/spam`)
      toast.success('Marked as spam')
      fetchMessages()
      fetchStats()
    } catch (error) {
      toast.error('Failed to update message')
    }
  }

  const handleMarkAsNotSpam = async (id) => {
    try {
      await api.put(`/contact-messages/${id}/not-spam`)
      toast.success('Marked as not spam')
      fetchMessages()
      fetchStats()
    } catch (error) {
      toast.error('Failed to update message')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      await api.delete(`/contact-messages/${id}`)
      toast.success('Message deleted')
      fetchMessages()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && messages.length === 0) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Messages</h1>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-sm text-blue-600">Unread</p>
            <p className="text-2xl font-bold text-blue-900">{stats.unread}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-red-600">Spam</p>
            <p className="text-2xl font-bold text-red-900">{stats.spam}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-green-600">Today</p>
            <p className="text-2xl font-bold text-green-900">{stats.today}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.read}
                onChange={(e) => setFilters({ ...filters, read: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spam</label>
              <select
                value={filters.spam}
                onChange={(e) => setFilters({ ...filters, spam: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="false">Not Spam</option>
                <option value="true">Spam</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Search by name, email, or message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No messages found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !message.read ? 'bg-blue-50' : ''
                } ${message.spam ? 'bg-red-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
                      {!message.read && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          New
                        </span>
                      )}
                      {message.spam && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          Spam
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <a href={`mailto:${message.email}`} className="hover:text-blue-600">
                        {message.email}
                      </a>
                      {message.phone && ` • ${message.phone}`}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    {!message.read && (
                      <button
                        onClick={() => handleMarkAsRead(message._id)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Mark Read
                      </button>
                    )}
                    {!message.spam ? (
                      <button
                        onClick={() => handleMarkAsSpam(message._id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Mark Spam
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsNotSpam(message._id)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Not Spam
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mt-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContactMessages

