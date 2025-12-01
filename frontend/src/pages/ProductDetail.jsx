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
    <div className="w-full">
      {/* Hero Header Section */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 animate-fade-in">
            {product.title}
          </h1>
          <div className="flex items-center gap-4">
            {hasDiscount ? (
              <div className="flex items-center gap-4">
                <span className="text-2xl md:text-3xl font-light tracking-wide">${price.toFixed(2)}</span>
                <span className="text-lg md:text-xl text-white/60 line-through font-light">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-2xl md:text-3xl font-light tracking-wide">${price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </section>

      {/* Product Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-50 overflow-hidden mb-6 group">
                <img
                  src={getImageUrl(product.images?.[selectedImage])}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'
                  }}
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-50 overflow-hidden border transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-black' 
                          : 'border-black/20 hover:border-black/40'
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
              <p className="text-base md:text-lg text-black/70 mb-8 font-light leading-relaxed tracking-wide">
                {product.description}
              </p>

              {/* Stock Availability */}
              <div className="mb-8 flex items-center gap-3 pb-6 border-b border-black/10">
                {product.stock > 0 ? (
                  <>
                    <svg className={`w-5 h-5 flex-shrink-0 ${
                      product.stock > 10 ? 'text-green-600' : product.stock > 5 ? 'text-yellow-600' : 'text-orange-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`text-sm font-light tracking-wide ${
                      product.stock > 10 ? 'text-green-700' : product.stock > 5 ? 'text-yellow-700' : 'text-orange-700'
                    }`}>
                      {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-light tracking-wide text-red-700">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-4">
                  Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border transition-all duration-300 font-light tracking-wide text-sm ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-black/20 text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-8">
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-4">
                  Color
                </label>
                <div className="flex flex-wrap gap-6">
                  {product.colors.map(colorName => {
                    const colorInfo = colorsMap[colorName.toLowerCase()]
                    const hexCode = colorInfo?.hexCode || '#000000'
                    const displayName = colorInfo?.displayName || colorName
                    const isSelected = selectedColor === colorName
                    
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className="flex flex-col items-center gap-3 transition-all duration-300 hover:opacity-80"
                        title={displayName}
                      >
                        <div
                          className={`w-14 h-14 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${
                            isSelected ? 'border-black ring-2 ring-black ring-offset-2' : 'border-black/20'
                          }`}
                          style={{ backgroundColor: hexCode }}
                        />
                        <span className={`text-xs font-light tracking-wide ${isSelected ? 'text-black' : 'text-black/60'}`}>
                          {displayName}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8 pb-6 border-b border-black/10">
                <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-4">
                  Quantity
                </label>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="w-12 h-12 border border-black/20 hover:border-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-light text-lg"
                  >
                    −
                  </button>
                  <span className="text-xl font-light tracking-wide w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 0, quantity + 1))}
                    disabled={product.stock === 0 || quantity >= product.stock}
                    className="w-12 h-12 border border-black/20 hover:border-black transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-light text-lg"
                  >
                    +
                  </button>
                </div>
                {product.stock > 0 && (
                  <p className="text-xs text-black/50 mt-3 font-light tracking-wide">
                    Maximum {product.stock} available
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 border-2 border-black text-black px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`px-6 py-4 border border-black/20 hover:border-black transition-all duration-300 ${
                      isInWishlist(product._id)
                        ? 'border-black'
                        : ''
                    }`}
                    title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg
                      className={`w-6 h-6 ${isInWishlist(product._id) ? 'fill-black text-black' : 'text-black/60'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleDirectOrder}
                  disabled={product.stock === 0}
                  className="w-full bg-black text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Order Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

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

