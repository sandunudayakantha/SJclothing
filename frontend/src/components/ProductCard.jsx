import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../config/api'

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useCart()
  const inWishlist = isInWishlist(product._id)
  const price = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  return (
    <div className="group relative bg-white overflow-hidden">
      {product.newArrival && (
        <span className="absolute top-4 left-4 bg-black text-white text-xs px-3 py-1.5 tracking-widest uppercase font-light z-10">
          New
        </span>
      )}
      {product.featured && (
        <span className="absolute top-4 right-4 bg-white text-black text-xs px-3 py-1.5 tracking-widest uppercase font-light z-10 border border-black/10">
          Featured
        </span>
      )}

      <Link to={`/products/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gray-50">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
          />
        </div>
      </Link>

      <div className="pt-6 pb-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-sm font-light text-black mb-2 tracking-wide hover:text-black/70 transition-colors duration-300 line-clamp-2">
            {product.title}
          </h3>
        </Link>
        
        {/* Stock Availability - Minimal */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <span className={`text-xs font-light tracking-wide ${
              product.stock > 10 ? 'text-gray-600' : product.stock > 5 ? 'text-gray-500' : 'text-orange-600'
            }`}>
              {product.stock > 10 ? 'In Stock' : `${product.stock} left`}
            </span>
          ) : (
            <span className="text-xs font-light text-gray-400 tracking-wide">Out of Stock</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-light text-black tracking-wide">${price.toFixed(2)}</span>
                <span className="text-xs text-gray-400 line-through font-light">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-base font-light text-black tracking-wide">${price.toFixed(2)}</span>
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
            className="text-gray-300 hover:text-black transition-colors duration-300"
          >
            <svg
              className={`w-5 h-5 ${inWishlist ? 'fill-black text-black' : ''}`}
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
      </div>
    </div>
  )
}

export default ProductCard

