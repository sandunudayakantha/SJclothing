import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../config/api'
import { useCart } from '../context/CartContext'
import Loading from '../components/Loading'
import DirectOrderModal from '../components/DirectOrderModal'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [colorsMap, setColorsMap] = useState({})
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showDirectOrder, setShowDirectOrder] = useState(false)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart()

  useEffect(() => {
    fetchColors()
    fetchProduct()
  }, [id])

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      // Create a map of color name -> color object for quick lookup
      const map = {}
      response.data.forEach(color => {
        map[color.name.toLowerCase()] = color
      })
      setColorsMap(map)
    } catch (error) {
      console.error('Error fetching colors:', error)
      // Continue even if colors fail to load
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
      if (response.data.sizes.length > 0) {
        setSelectedSize(response.data.sizes[0])
      }
      if (response.data.colors.length > 0) {
        setSelectedColor(response.data.colors[0])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color')
      return
    }

    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`)
      setQuantity(product.stock)
      return
    }

    try {
      addToCart(product, selectedSize, selectedColor, quantity)
      toast.success('Added to cart!')
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart')
    }
  }

  const handleDirectOrder = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color')
      return
    }

    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`)
      setQuantity(product.stock)
      return
    }

    setShowDirectOrder(true)
  }

  const handleWishlist = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist')
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!product) {
    return null
  }

  const price = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={getImageUrl(product.images?.[selectedImage])}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150?text=No+Image'
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          
          <div className="mb-4">
            {hasDiscount ? (
              <div>
                <span className="text-3xl font-bold text-accent">${price.toFixed(2)}</span>
                <span className="text-xl text-gray-500 line-through ml-3">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-accent">${price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Stock Availability */}
          <div className="mb-6 p-4 rounded-lg border-2 bg-gray-50">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${
                  product.stock > 10 ? 'text-green-600' : product.stock > 5 ? 'text-yellow-600' : 'text-orange-600'
                }`}>
                  {product.stock > 10 ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Only {product.stock} left in stock
                    </span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-red-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 rounded-lg transition ${
                    selectedSize === size
                      ? 'border-accent bg-accent text-white'
                      : 'border-gray-300 hover:border-accent'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-4">
              {product.colors.map(colorName => {
                const colorInfo = colorsMap[colorName.toLowerCase()]
                const hexCode = colorInfo?.hexCode || '#000000'
                const displayName = colorInfo?.displayName || colorName
                const isSelected = selectedColor === colorName
                
                return (
                  <button
                    key={colorName}
                    onClick={() => setSelectedColor(colorName)}
                    className="flex flex-col items-center gap-2 transition-opacity hover:opacity-80"
                    title={displayName}
                  >
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex-shrink-0 ${
                        isSelected ? 'border-accent ring-2 ring-accent ring-offset-2' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: hexCode }}
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-accent' : 'text-gray-700'}`}>
                      {displayName}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                disabled={product.stock === 0 || quantity >= product.stock}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            {product.stock > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum {product.stock} available
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`px-6 py-3 rounded-lg border-2 transition ${
                  isInWishlist(product._id)
                    ? 'border-red-500 text-red-500'
                    : 'border-gray-300 hover:border-red-500'
                }`}
              >
                <svg
                  className={`w-6 h-6 ${isInWishlist(product._id) ? 'fill-red-500' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={handleDirectOrder}
              disabled={product.stock === 0}
              className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Order Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Direct Order Modal */}
      <DirectOrderModal
        isOpen={showDirectOrder}
        onClose={() => setShowDirectOrder(false)}
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        quantity={quantity}
      />
    </div>
  )
}

export default ProductDetail

