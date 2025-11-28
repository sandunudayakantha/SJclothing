import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { getImageUrl } from '../config/api'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [featuredRes, newArrivalsRes, settingsRes] = await Promise.all([
        api.get('/products?featured=true'),
        api.get('/products?newArrival=true'),
        api.get('/settings')
      ])

      setFeaturedProducts(featuredRes.data.slice(0, 8))
      setNewArrivals(newArrivalsRes.data.slice(0, 8))
      setSettings(settingsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        {settings?.banner?.image ? (
          <div
            className="h-[500px] bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${getImageUrl(settings.banner.image)})`
            }}
          >
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {settings.banner.title || 'Welcome to SJ Clothing'}
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                {settings.banner.description || 'Discover the latest fashion trends'}
              </p>
              <Link
                to="/products"
                className="bg-accent hover:bg-opacity-90 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                Shop Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to SJ Clothing</h1>
              <p className="text-xl md:text-2xl mb-8">Discover the latest fashion trends</p>
              <Link
                to="/products"
                className="bg-accent hover:bg-opacity-90 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Special Offer Banner */}
      {settings?.specialOffer?.enabled && (
        <section className="bg-accent text-white py-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-lg md:text-xl font-semibold">
              {settings.specialOffer.title || `Special Offer: ${settings.specialOffer.percentage}% OFF on All Items!`}
            </p>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link
            to="/products?featured=true"
            className="text-accent hover:underline font-semibold"
          >
            View All
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">No featured products available</p>
        )}
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
          <Link
            to="/products?newArrival=true"
            className="text-accent hover:underline font-semibold"
          >
            View All
          </Link>
        </div>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">No new arrivals available</p>
        )}
      </section>
    </div>
  )
}

export default Home

