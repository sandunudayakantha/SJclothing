import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../config/api'

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useCart()
  const inWishlist = isInWishlist(product._id)
  const price = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {product.newArrival && (
        <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded z-10">
          New
        </span>
      )}
      {product.featured && (
        <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded z-10">
          Featured
        </span>
      )}

      <Link to={`/products/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
          />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-accent transition">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        
        {/* Stock Availability */}
        <div className="mb-2">
          {product.stock > 0 ? (
            <span className={`text-xs font-medium ${
              product.stock > 10 ? 'text-green-600' : product.stock > 5 ? 'text-yellow-600' : 'text-orange-600'
            }`}>
              {product.stock > 10 ? '✓ In Stock' : `Only ${product.stock} left`}
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">Out of Stock</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div>
                <span className="text-lg font-bold text-accent">${price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-accent">${price.toFixed(2)}</span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault()
              if (inWishlist) {
                removeFromWishlist(product._id)
              } else {
                addToWishlist(product)
              }
            }}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <svg
              className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`}
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
      </div>
    </div>
  )
}

export default ProductCard

