import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../config/api'
import api from '../config/api'
import toast from 'react-hot-toast'

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal } = useCart()
  const [colorsMap, setColorsMap] = useState({})

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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to get started!</p>
        <Link
          to="/products"
          className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.product}-${item.size}-${item.color}-${index}`}
                className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4"
              >
                <img
                  src={getImageUrl(item.productData.images?.[0])}
                  alt={item.productData.title}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/96x96?text=No+Image'
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.productData.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Color: 
                    </p>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: getColorInfo(item.color).hexCode }}
                      />
                      <span className="text-sm text-gray-600">{getColorInfo(item.color).displayName}</span>
                    </div>
                  </div>
                  {/* Stock Info */}
                  {item.productData?.stock !== undefined && (
                    <div className="mb-2">
                      {item.productData.stock > 0 ? (
                        <span className={`text-xs font-medium ${
                          item.productData.stock > 10 ? 'text-green-600' : 
                          item.productData.stock > 5 ? 'text-yellow-600' : 'text-orange-600'
                        }`}>
                          {item.productData.stock > 10 
                            ? `✓ ${item.productData.stock} in stock` 
                            : `Only ${item.productData.stock} left`}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-600">Out of Stock</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-accent">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.product, item.size, item.color, item.quantity - 1)
                          }
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
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
                          className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.product, item.size, item.color)
                          toast.success('Item removed from cart')
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-accent text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/products"
              className="block w-full text-center mt-4 text-gray-600 hover:text-accent transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

