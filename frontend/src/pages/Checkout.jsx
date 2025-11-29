import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../config/api'
import { useCart } from '../context/CartContext'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, getCartTotal, clearCart } = useCart()
  const [colorsMap, setColorsMap] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      const map = {}
      response.data.forEach(color => {
        map[color.name.toLowerCase()] = color
      })
      setColorsMap(map)
    } catch (error) {
      console.error('Error fetching colors:', error)
    }
  }

  const getColorInfo = (colorName) => {
    const colorInfo = colorsMap[colorName?.toLowerCase()] || {}
    return {
      hexCode: colorInfo.hexCode || '#000000',
      displayName: colorInfo.displayName || colorName
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      toast.error('Please fill in all fields')
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        })),
        customer: formData
      }

      const response = await api.post('/orders', orderData)
      toast.success('Order placed successfully!')
      clearCart()
      navigate('/')
    } catch (error) {
      console.error('Error placing order:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to checkout!</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Delivery Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Payment Method:</strong> Cash on Delivery
              </p>
              <p className="text-xs text-gray-500">
                You will pay when you receive your order.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.product}-${item.size}-${item.color}-${index}`}
                  className="flex gap-4"
                >
                  <img
                    src={getImageUrl(item.productData.images?.[0])}
                    alt={item.productData.title}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=No+Image'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {item.productData.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{item.size} |</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: getColorInfo(item.color).hexCode }}
                        />
                        <span>{getColorInfo(item.color).displayName}</span>
                      </div>
                      <span>x {item.quantity}</span>
                    </div>
                    <p className="text-sm font-semibold text-accent mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

