import { useState, useEffect } from 'react'
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
  const [colorsMap, setColorsMap] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchColors()
    }
  }, [isOpen])

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      const map = {}
      response.data.forEach(color => {
        map[color.name.toLowerCase()] = color
      })
      setColorsMap(map)
    } catch (error) {
      console.error('Error fetching colors for modal:', error)
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
  const selectedColorInfo = getColorInfo(selectedColor)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-down">
        {/* Header */}
        <div className="bg-black text-white px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">Direct Order</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors duration-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {/* Product Summary */}
          <div className="border border-black/10 p-6 mb-8">
            <div className="flex gap-6">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 overflow-hidden flex-shrink-0">
                <img
                  src={product.images?.[0] ? getImageUrl(product.images[0]) : 'https://via.placeholder.com/160x160?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/160x160?text=No+Image'
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-light text-black mb-3 tracking-wide">{product.title}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-black/70 font-light tracking-wide">
                    Size: <span className="text-black">{selectedSize}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black/70 font-light tracking-wide">Color:</span>
                    <div
                      className="w-5 h-5 rounded-full border border-black/20"
                      style={{ backgroundColor: selectedColorInfo.hexCode }}
                    />
                    <span className="text-sm text-black font-light">{selectedColorInfo.displayName}</span>
                  </div>
                  <p className="text-sm text-black/70 font-light tracking-wide">
                    Quantity: <span className="text-black">{quantity}</span>
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-light text-black tracking-wide">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="mb-8 pb-6 border-b border-black/10">
            <h3 className="text-xl md:text-2xl font-light tracking-tight text-black mb-6">
              Delivery Information
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                  Delivery Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide resize-none"
                  placeholder="Your complete delivery address"
                />
              </div>

              <div className="bg-gray-50 p-6 border border-black/10">
                <p className="text-sm font-light tracking-wide text-black mb-2">
                  <span className="uppercase tracking-widest text-xs text-black/60">Payment Method:</span> Cash on Delivery
                </p>
                <p className="text-xs text-black/50 font-light tracking-wide">
                  You will pay when you receive your order.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border-2 border-black/20 text-black px-8 py-4 text-sm tracking-widest uppercase font-light hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DirectOrderModal

