import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../config/api'

const Footer = () => {
  const [settings, setSettings] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        api.get('/settings'),
        api.get('/categories')
      ])
      setSettings(settingsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching footer data:', error)
    }
  }

  const handleWhatsAppClick = () => {
    if (!settings?.contact?.whatsapp) return
    const phoneNumber = settings.contact.whatsapp.replace(/\D/g, '')
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}`, '_blank')
    }
  }

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Brand Section */}
          <div>
            <Link to="/" className="block mb-6">
              <span className="text-2xl font-light tracking-widest uppercase">
                SJ Clothing
              </span>
            </Link>
            <p className="text-sm text-white/70 font-light tracking-wide leading-relaxed mb-6">
              Discover timeless elegance and contemporary style. Curated collections for the modern wardrobe.
            </p>
            {settings?.contact && (
              <div className="space-y-3">
                {settings.contact.email && (
                  <a 
                    href={`mailto:${settings.contact.email}`}
                    className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
                  >
                    {settings.contact.email}
                  </a>
                )}
                {settings.contact.phone && (
                  <a 
                    href={`tel:${settings.contact.phone}`}
                    className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
                  >
                    {settings.contact.phone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="text-sm font-light tracking-widest uppercase mb-6 pb-2 border-b border-white/10">
              Categories
            </h3>
            <nav className="space-y-3">
              {categories.slice(0, 6).map(category => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/products"
                className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide mt-4"
              >
                View All →
              </Link>
            </nav>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-sm font-light tracking-widest uppercase mb-6 pb-2 border-b border-white/10">
              Information
            </h3>
            <nav className="space-y-3">
              <Link
                to="/products"
                className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
              >
                All Products
              </Link>
              <Link
                to="/products?featured=true"
                className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
              >
                Featured
              </Link>
              <Link
                to="/products?newArrival=true"
                className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
              >
                New Arrivals
              </Link>
              <Link
                to="/contact"
                className="block text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Contact & Social Section */}
          <div>
            <h3 className="text-sm font-light tracking-widest uppercase mb-6 pb-2 border-b border-white/10">
              Connect
            </h3>
            <div className="space-y-4">
              {settings?.contact?.whatsapp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-3 text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">WhatsApp</span>
                </button>
              )}
              {settings?.contact?.callPhone && (
                <a
                  href={`tel:${settings.contact.callPhone}`}
                  className="flex items-center gap-3 text-xs text-white/70 hover:text-white transition-colors duration-300 font-light tracking-wide group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Call Us</span>
                </a>
              )}
              {settings?.contact?.address && (
                <div className="text-xs text-white/70 font-light tracking-wide leading-relaxed">
                  {settings.contact.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/50 font-light tracking-wide">
              © {new Date().getFullYear()} SJ Clothing. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/contact"
                className="text-xs text-white/50 hover:text-white/70 transition-colors duration-300 font-light tracking-wide"
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                className="text-xs text-white/50 hover:text-white/70 transition-colors duration-300 font-light tracking-wide"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

