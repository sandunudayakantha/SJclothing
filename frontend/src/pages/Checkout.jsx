import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../config/api'
import { useCart } from '../context/CartContext'

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, getCartTotal, clearCart } = useCart()
  const [colorsMap, setColorsMap] = useState({})
  const [settings, setSettings] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchColors()
    fetchSettings()
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

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  // Calculate delivery fee
  const calculateDeliveryFee = () => {
    if (!settings || !cart.length) return 0
    
    // Check if all products have free delivery
    const allFreeDelivery = cart.every(item => item.productData?.freeDelivery === true)
    
    if (allFreeDelivery) {
      return 0
    }
    
    // Return the default delivery fee from settings
    return settings.deliveryFee || 0
  }

  const deliveryFee = calculateDeliveryFee()
  const subtotal = getCartTotal()
  const total = subtotal + deliveryFee

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
        customer: formData,
        deliveryFee: deliveryFee
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
      <div className="w-full">
        {/* Hero Header Section */}
        <section className="bg-black text-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 animate-fade-in">
              Your Cart is Empty
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-light tracking-wide mb-8">
              Add some products to checkout!
            </p>
          </div>
        </section>

        {/* Empty Cart Content */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <button
              onClick={() => navigate('/products')}
              className="inline-block border-2 border-black text-black px-10 py-4 text-sm tracking-widest uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Hero Header Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-2 animate-fade-in">
            Checkout
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-wide">
            Complete your order
          </p>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {/* Checkout Form */}
            <div>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight text-black mb-8 pb-4 border-b border-black/10">
                Delivery Information
              </h2>
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
                    rows="4"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="border border-black/10 p-8 sticky top-20">
                <h2 className="text-xl md:text-2xl font-light tracking-tight text-black mb-8 pb-4 border-b border-black/10">
                  Order Summary
                </h2>
                <div className="space-y-6 mb-8">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product}-${item.size}-${item.color}-${index}`}
                      className="flex gap-4 pb-6 border-b border-black/10 last:border-b-0 last:pb-0"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item.productData.images?.[0])}
                          alt={item.productData.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/96x96?text=No+Image'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-light text-black text-sm md:text-base mb-2 tracking-wide line-clamp-2">
                          {item.productData.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-black/60 font-light tracking-wide mb-2">
                          <span>{item.size}</span>
                          <span className="text-black/20">|</span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0"
                              style={{ backgroundColor: getColorInfo(item.color).hexCode }}
                            />
                            <span>{getColorInfo(item.color).displayName}</span>
                          </div>
                          <span className="text-black/20">|</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <p className="text-base font-light text-black tracking-wide">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black/10 pt-6 space-y-4">
                  <div className="flex justify-between text-black/70 font-light tracking-wide">
                    <span>Subtotal</span>
                    <span className="text-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-black/70 font-light tracking-wide">
                    <span>Delivery</span>
                    <span className="text-black">
                      {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-black/10 pt-4 mt-4">
                    <div className="flex justify-between text-xl font-light tracking-wide text-black">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Checkout

