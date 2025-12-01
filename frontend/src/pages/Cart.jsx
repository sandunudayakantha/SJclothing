import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../config/api'
import api from '../config/api'
import toast from 'react-hot-toast'

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useCart()
  const [colorsMap, setColorsMap] = useState({})
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchColors()
    fetchSettings()
  }, [])

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

  const handleQuantityChange = (productId, size, color, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size, color)
      toast.success('Item removed from cart')
    } else {
      // Find the item to check stock
      const item = cart.find(
        item => item.product === productId && item.size === size && item.color === color
      )
      
      if (item && item.productData?.stock !== undefined) {
        if (newQuantity > item.productData.stock) {
          toast.error(`Only ${item.productData.stock} items available`)
          updateCartQuantity(productId, size, color, item.productData.stock)
          return
        }
      }
      
      updateCartQuantity(productId, size, color, newQuantity)
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
              Add some products to get started!
            </p>
          </div>
        </section>

        {/* Empty Cart Content */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <Link
              to="/products"
              className="inline-block border-2 border-black text-black px-10 py-4 text-sm tracking-widest uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
            >
              Continue Shopping
            </Link>
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
            Shopping Cart
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-wide">
            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product}-${item.size}-${item.color}-${index}`}
                    className="border-b border-black/10 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex gap-6">
                      <Link
                        to={`/products/${item.product}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 overflow-hidden group">
                          <img
                            src={getImageUrl(item.productData.images?.[0])}
                            alt={item.productData.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/160x160?text=No+Image'
                            }}
                          />
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link to={`/products/${item.product}`}>
                          <h3 className="text-lg md:text-xl font-light text-black mb-3 tracking-wide hover:text-black/70 transition-colors duration-300">
                            {item.productData.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 mb-3">
                          <p className="text-sm text-black/60 font-light tracking-wide">
                            Size: <span className="text-black">{item.size}</span>
                          </p>
                          <span className="text-black/20">|</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-black/60 font-light tracking-wide">Color:</span>
                            <div
                              className="w-5 h-5 rounded-full border border-black/20"
                              style={{ backgroundColor: getColorInfo(item.color).hexCode }}
                            />
                            <span className="text-sm text-black font-light">{getColorInfo(item.color).displayName}</span>
                          </div>
                        </div>
                        {/* Stock Info */}
                        {item.productData?.stock !== undefined && (
                          <div className="mb-4">
                            {item.productData.stock > 0 ? (
                              <span className={`text-xs font-light tracking-wide ${
                                item.productData.stock > 10 ? 'text-green-700' : 
                                item.productData.stock > 5 ? 'text-yellow-700' : 'text-orange-700'
                              }`}>
                                {item.productData.stock > 10 
                                  ? `In Stock (${item.productData.stock} available)` 
                                  : `Only ${item.productData.stock} left`}
                              </span>
                            ) : (
                              <span className="text-xs font-light tracking-wide text-red-700">Out of Stock</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-6">
                          <div>
                            <p className="text-xl md:text-2xl font-light text-black tracking-wide">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.product, item.size, item.color, item.quantity - 1)
                                }
                                className="w-12 h-12 border border-black/20 hover:border-black transition-all duration-300 flex items-center justify-center font-light text-lg"
                              >
                                −
                              </button>
                              <span className="text-lg font-light tracking-wide w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  const maxQuantity = item.productData?.stock || Infinity
                                  const newQuantity = Math.min(item.quantity + 1, maxQuantity)
                                  if (newQuantity > item.quantity) {
                                    handleQuantityChange(item.product, item.size, item.color, newQuantity)
                                  } else if (item.quantity >= maxQuantity) {
                                    toast.error(`Only ${maxQuantity} items available`)
                                  }
                                }}
                                disabled={item.productData?.stock !== undefined && item.quantity >= item.productData.stock}
                                className="w-12 h-12 border border-black/20 hover:border-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-light text-lg"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                removeFromCart(item.product, item.size, item.color)
                                toast.success('Item removed from cart')
                              }}
                              className="text-black/40 hover:text-black transition-colors duration-300"
                              title="Remove item"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-black/10 p-8 sticky top-20">
                <h2 className="text-xl md:text-2xl font-light tracking-tight text-black mb-8 pb-4 border-b border-black/10">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-8">
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
                <Link
                  to="/checkout"
                  className="block w-full bg-black text-white text-center px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 mb-4"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="block w-full text-center text-sm tracking-widest uppercase font-light text-black/60 hover:text-black transition-colors duration-300"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Cart

