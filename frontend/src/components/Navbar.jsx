import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import api from '../config/api'

const Navbar = () => {
  const [categories, setCategories] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { getCartCount } = useCart()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close categories dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCategoriesOpen && !event.target.closest('.categories-dropdown')) {
        setIsCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCategoriesOpen])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Silently fail - categories dropdown will just be empty
      // This prevents the app from breaking if backend is not available
    }
  }

  return (
    <nav className={`${
      isScrolled 
        ? 'fixed bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5' 
        : 'absolute bg-transparent'
    } top-0 left-0 right-0 z-50 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <span className={`text-xl md:text-2xl font-light tracking-widest uppercase transition-colors duration-300 ${
              isScrolled ? 'text-black' : 'text-white'
            }`}>
              SJ Clothing
            </span>
          </Link>

          {/* Desktop Navigation - Luxury Style */}
          <div className="hidden md:flex items-center space-x-10">
            <Link 
              to="/" 
              className={`text-sm transition-colors duration-300 tracking-wider uppercase font-light ${
                isScrolled ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
            >
              Home
            </Link>
            
            {/* Categories Mega Menu - Click to Open */}
            <div className="relative categories-dropdown">
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className={`text-sm transition-colors duration-300 flex items-center tracking-wider uppercase font-light ${
                  isScrolled ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'
                }`}
              >
                Categories
                <svg className={`ml-2 h-3 w-3 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Mega Menu Dropdown */}
              {isCategoriesOpen && (
                <div className={`absolute left-1/2 -translate-x-1/2 mt-8 w-screen max-w-6xl ${
                  isScrolled ? 'bg-white/98' : 'bg-white/95'
                } backdrop-blur-xl shadow-2xl border-t border-black/10 animate-fade-in`}>
                  <div className="px-12 py-12">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {categories.map((category) => (
                        <div 
                          key={category._id} 
                          className="group/item"
                        >
                          <Link
                            to={`/products?category=${category._id}`}
                            className="block mb-4"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            <h3 className="text-sm font-light tracking-widest uppercase text-black mb-4 pb-2 border-b border-black/10 group-hover/item:border-black/30 transition-colors duration-300">
                              {category.name}
                            </h3>
                          </Link>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="space-y-2">
                              {category.subcategories.map(sub => (
                                <Link
                                  key={sub._id}
                                  to={`/products?category=${sub._id}`}
                                  className="block text-xs text-gray-600 hover:text-black py-2 font-light tracking-wide transition-all duration-300 hover:translate-x-1 cursor-pointer"
                                  onClick={() => setIsCategoriesOpen(false)}
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                          {(!category.subcategories || category.subcategories.length === 0) && (
                            <Link
                              to={`/products?category=${category._id}`}
                              className="block text-xs text-gray-600 hover:text-black py-2 font-light tracking-wide transition-all duration-300 hover:translate-x-1 cursor-pointer"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              View All
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* View All Categories Link */}
                    <div className="mt-12 pt-8 border-t border-black/10">
                      <Link
                        to="/products"
                        className="inline-flex items-center text-xs tracking-widest uppercase font-light text-black hover:text-black/70 transition-colors duration-300 group/viewall cursor-pointer"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        View All Categories
                        <svg className="ml-2 h-3 w-3 transition-transform duration-300 group-hover/viewall:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link 
              to="/products" 
              className={`text-sm transition-colors duration-300 tracking-wider uppercase font-light ${
                isScrolled ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
            >
              Products
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm transition-colors duration-300 tracking-wider uppercase font-light ${
                isScrolled ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/cart"
              className={`relative transition-colors duration-300 ${
                isScrolled ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className={`absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center transition-colors duration-300 ${
                  isScrolled ? 'bg-black text-white' : 'bg-accent text-white'
                }`}>
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden transition-colors duration-300 ${
              isScrolled ? 'text-black' : 'text-white'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-md border-black/10' 
              : 'bg-black/80 backdrop-blur-sm border-white/20'
          }`}>
            <Link 
              to="/" 
              className={`block py-2 transition-colors ${
                isScrolled ? 'text-black hover:text-black/70' : 'text-white hover:text-accent'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`block py-2 transition-colors ${
                isScrolled ? 'text-black hover:text-black/70' : 'text-white hover:text-accent'
              }`}
            >
              All Products
            </Link>
            {categories.map(category => (
              <div key={category._id} className="py-2">
                <Link
                  to={`/products?category=${category._id}`}
                  className={`block transition-colors font-medium ${
                    isScrolled ? 'text-black hover:text-black/70' : 'text-white hover:text-accent'
                  }`}
                >
                  {category.name}
                </Link>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-4 mt-1">
                    {category.subcategories.map(sub => (
                      <Link
                        key={sub._id}
                        to={`/products?category=${sub._id}`}
                        className={`block text-sm py-1 transition-colors ${
                          isScrolled ? 'text-black/70 hover:text-black' : 'text-white/80 hover:text-accent'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link 
              to="/contact" 
              className={`block py-2 transition-colors ${
                isScrolled ? 'text-black hover:text-black/70' : 'text-white hover:text-accent'
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/cart" 
              className={`block py-2 transition-colors ${
                isScrolled ? 'text-black hover:text-black/70' : 'text-white hover:text-accent'
              }`}
            >
              Cart ({getCartCount()})
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

