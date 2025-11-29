import { useState } from 'react'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../config/api'

const DirectOrderModal = ({ isOpen, onClose, product, selectedSize, selectedColor, quantity }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

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

    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        items: [{
          product: product._id,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity
        }],
        customer: formData
      }

      const response = await api.post('/orders', orderData)
      toast.success('Order placed successfully!')
      onClose()
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: ''
      })
    } catch (error) {
      console.error('Error placing order:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to place order. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const price = product.discountPrice || product.price
  const total = price * quantity

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Direct Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex gap-4">
              <img
                src={product.images?.[0] ? getImageUrl(product.images[0]) : 'https://via.placeholder.com/80x80?text=No+Image'}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Size: {selectedSize} | Color: {selectedColor} | Qty: {quantity}
                </p>
                <p className="text-lg font-bold text-accent">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Payment Method:</strong> Cash on Delivery
              </p>
              <p className="text-xs text-gray-500">
                You will pay when you receive your order.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DirectOrderModal

