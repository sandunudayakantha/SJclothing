import { useState, useEffect } from 'react'
import api from '../config/api'
import Loading from '../components/Loading'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [messageStats, setMessageStats] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, messageStatsRes] = await Promise.all([
        api.get('/orders/stats'),
        api.get('/orders?limit=5'),
        api.get('/contact-messages/stats').catch(() => ({ data: { total: 0, unread: 0, spam: 0, today: 0 } }))
      ])
      setStats(statsRes.data)
      setOrders(ordersRes.data)
      setMessageStats(messageStatsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-accent">${(stats?.totalRevenue || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.deliveredOrders || 0}</p>
        </div>
      </div>

      {/* Contact Messages Stats */}
      {messageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Messages</h3>
            <p className="text-3xl font-bold text-gray-900">{messageStats.total || 0}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-600 text-sm font-semibold mb-2">Unread Messages</h3>
            <p className="text-3xl font-bold text-blue-900">{messageStats.unread || 0}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-600 text-sm font-semibold mb-2">Spam Messages</h3>
            <p className="text-3xl font-bold text-red-900">{messageStats.spam || 0}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-600 text-sm font-semibold mb-2">Messages Today</h3>
            <p className="text-3xl font-bold text-green-900">{messageStats.today || 0}</p>
          </div>
        </div>
      )}

      {/* Latest Orders */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Latest Orders</h2>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-gray-700">{order.customer.name}</td>
                    <td className="py-3 px-4 text-gray-700 font-semibold">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Dispatched' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard

