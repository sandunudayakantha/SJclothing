import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import api from '../config/api'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const categoryParam = searchParams.get('category')
  const featured = searchParams.get('featured')
  const newArrival = searchParams.get('newArrival')
  const search = searchParams.get('search')

  // Filter out "null" string values from URL params
  const category = categoryParam && categoryParam !== 'null' ? categoryParam : null

  const { products, loading } = useProducts({
    category: category,
    featured: featured === 'true' ? 'true' : null,
    newArrival: newArrival === 'true' ? 'true' : null,
    search: search || null
  })

  useEffect(() => {
    fetchCategories()
    // Only set selected category if it's a valid ID (not "null" string)
    if (category && category !== 'null' && category !== 'undefined') {
      setSelectedCategory(category)
    } else {
      setSelectedCategory(null)
    }
  }, [category])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      const params = new URLSearchParams()
      params.set('search', searchTerm.trim())
      navigate(`/products?${params.toString()}`)
    }
  }

  const handleCategoryFilter = (categoryId) => {
    const params = new URLSearchParams()
    
    // Only add category if it's a valid ID (not null)
    if (categoryId && categoryId !== null) {
      if (categoryId === selectedCategory) {
        // Remove filter if clicking same category
        setSelectedCategory(null)
      } else {
        setSelectedCategory(categoryId)
        params.set('category', categoryId)
      }
    } else {
      // Clear category filter
      setSelectedCategory(null)
    }
    
    // Preserve other filters
    if (featured === 'true') params.set('featured', featured)
    if (newArrival === 'true') params.set('newArrival', newArrival)
    if (search) params.set('search', search)
    
    const queryString = params.toString()
    navigate(queryString ? `/products?${queryString}` : '/products')
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSearchTerm('')
    navigate('/products')
  }

  const getPageTitle = () => {
    if (featured === 'true') return 'Featured Products'
    if (newArrival === 'true') return 'New Arrivals'
    if (search) return `Search: "${search}"`
    if (category) {
      const cat = categories.find(c => c._id === category)
      return cat ? cat.name : 'Products'
    }
    return 'All Products'
  }

  if (loading) {
    return <Loading />
  }

  const hasActiveFilters = category || featured === 'true' || newArrival === 'true' || search

  return (
    <div className="w-full">
      {/* Hero Header Section */}
      <section className="bg-black text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
            {getPageTitle()}
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-wide max-w-2xl">
            {products.length > 0 
              ? `Discover ${products.length} ${products.length === 1 ? 'product' : 'products'} in our collection`
              : 'Explore our curated selection of premium fashion'}
          </p>
        </div>
      </section>

      {/* Filters and Search Section */}
      <section className="bg-white border-b border-black/5 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search Bar - Luxury Style */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm || search || ''}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black/60 hover:text-black transition-colors duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs tracking-widest uppercase font-light text-black/60">Filters:</span>
                {featured === 'true' && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    Featured
                  </span>
                )}
                {newArrival === 'true' && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    New Arrivals
                  </span>
                )}
                {search && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    Search: {search}
                  </span>
                )}
                {category && (
                  <span className="text-xs px-3 py-1 border border-black/20 text-black font-light tracking-wide">
                    {categories.find(c => c._id === category)?.name || 'Category'}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-black/60 hover:text-black transition-colors duration-300 font-light tracking-wide underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="mt-6 pt-6 border-t border-black/5">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs tracking-widest uppercase font-light text-black/60">Categories:</span>
                <button
                  onClick={() => handleCategoryFilter(null)}
                  className={`text-xs px-4 py-2 border transition-all duration-300 font-light tracking-wide ${
                    !selectedCategory
                      ? 'border-black text-black bg-black/5'
                      : 'border-black/20 text-black/60 hover:border-black hover:text-black'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryFilter(cat._id)}
                    className={`text-xs px-4 py-2 border transition-all duration-300 font-light tracking-wide ${
                      selectedCategory === cat._id
                        ? 'border-black text-black bg-black/5'
                        : 'border-black/20 text-black/60 hover:border-black hover:text-black'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-2xl font-light tracking-wide text-black/40 mb-4">No products found</p>
              <p className="text-sm font-light tracking-wide text-black/30 mb-8">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="text-sm px-6 py-3 border border-black/20 text-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wide uppercase"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Products

