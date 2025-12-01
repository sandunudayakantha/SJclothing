import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import api, { getImageUrl } from '../config/api'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(1) // Start at 1 because we add a clone at the start
  const [prevBannerIndex, setPrevBannerIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState('right') // 'left' or 'right'
  const currentIndexRef = useRef(1)
  const sliderRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  // Get banner images (support both arrays and single image for backward compatibility)
  const originalBannerImages = useMemo(() => {
    if (settings?.banner?.images && Array.isArray(settings.banner.images) && settings.banner.images.length > 0) {
      return settings.banner.images
    }
    if (settings?.banner?.image) {
      return [settings.banner.image]
    }
    return []
  }, [settings?.banner?.images, settings?.banner?.image])

  // Create infinite loop by duplicating first and last images
  const bannerImages = useMemo(() => {
    if (originalBannerImages.length <= 1) {
      return originalBannerImages
    }
    // Add clone of last image at the beginning and first image at the end
    return [
      originalBannerImages[originalBannerImages.length - 1], // Clone of last image
      ...originalBannerImages,
      originalBannerImages[0] // Clone of first image
    ]
  }, [originalBannerImages])

  // Update ref when index changes
  useEffect(() => {
    currentIndexRef.current = currentBannerIndex
  }, [currentBannerIndex])

  // Handle infinite loop transitions - jump seamlessly after transition completes
  useEffect(() => {
    if (originalBannerImages.length <= 1) return

    const totalImages = bannerImages.length
    const realImagesCount = originalBannerImages.length

    const handleTransitionEnd = () => {
      if (!sliderRef.current) return

      // If we're at the clone of the last image (index 0), jump to the real last image
      if (currentBannerIndex === 0) {
        sliderRef.current.style.transition = 'none'
        sliderRef.current.style.transform = `translateX(-${realImagesCount * 100}vw)`
        // Force reflow
        void sliderRef.current.offsetWidth
        // Re-enable transition and update index
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition = ''
            setCurrentBannerIndex(realImagesCount)
          }
        }, 10)
      }
      // If we're at the clone of the first image (last index), jump to the real first image
      else if (currentBannerIndex === totalImages - 1) {
        sliderRef.current.style.transition = 'none'
        sliderRef.current.style.transform = `translateX(-${1 * 100}vw)`
        // Force reflow
        void sliderRef.current.offsetWidth
        // Re-enable transition and update index
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.style.transition = ''
            setCurrentBannerIndex(1)
          }
        }, 10)
      }
    }

    const slider = sliderRef.current
    if (slider) {
      slider.addEventListener('transitionend', handleTransitionEnd)
      return () => {
        slider.removeEventListener('transitionend', handleTransitionEnd)
      }
    }
  }, [currentBannerIndex, originalBannerImages.length, bannerImages.length])

  // Auto-rotate banner images
  useEffect(() => {
    if (originalBannerImages.length <= 1) {
      setCurrentBannerIndex(0)
      setPrevBannerIndex(0)
      currentIndexRef.current = 0
      return
    }

    const interval = setInterval(() => {
      setSlideDirection('right')
      setPrevBannerIndex(currentIndexRef.current)
      setCurrentBannerIndex((prev) => {
        const next = prev + 1
        currentIndexRef.current = next
        return next
      })
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [originalBannerImages.length])

  // Reset index when images change
  useEffect(() => {
    if (originalBannerImages.length > 1) {
      setCurrentBannerIndex(1) // Start at first real image
      setPrevBannerIndex(0)
      setSlideDirection('right')
      currentIndexRef.current = 1
    } else {
      setCurrentBannerIndex(0)
      setPrevBannerIndex(0)
      currentIndexRef.current = 0
    }
  }, [originalBannerImages.length])

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

  const goToBanner = (index) => {
    if (originalBannerImages.length <= 1) return
    
    // Map dot index (0-based for real images) to carousel index (1-based because of clone)
    const carouselIndex = index + 1
    
    if (carouselIndex === currentBannerIndex) return
    const direction = carouselIndex > currentBannerIndex ? 'right' : 'left'
    setSlideDirection(direction)
    setPrevBannerIndex(currentBannerIndex)
    setCurrentBannerIndex(carouselIndex)
  }

  const goToNextBanner = () => {
    if (originalBannerImages.length <= 1) return
    setSlideDirection('right')
    setPrevBannerIndex(currentBannerIndex)
    setCurrentBannerIndex((prev) => prev + 1)
  }

  const goToPrevBanner = () => {
    if (originalBannerImages.length <= 1) return
    setSlideDirection('left')
    setPrevBannerIndex(currentBannerIndex)
    setCurrentBannerIndex((prev) => prev - 1)
  }

  return (
    <div className="w-full">
      {/* Hero Section - Full Screen Luxury Style with Carousel */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {bannerImages.length > 0 ? (
          <>
            {/* Banner Images Carousel with Continuous Slide Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                ref={sliderRef}
                className="banner-slider-container"
                style={{
                  width: `${bannerImages.length * 100}vw`,
                  transform: `translateX(-${currentBannerIndex * 100}vw)`
                }}
              >
                {bannerImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="banner-slide-item"
                    style={{
                      backgroundImage: `url(${getImageUrl(image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100vw',
                      minWidth: '100vw'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            {bannerImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevBanner}
                  className="absolute left-4 md:left-8 z-20 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-full group"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextBanner}
                  className="absolute right-4 md:right-8 z-20 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 rounded-full group"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Navigation Dots */}
            {originalBannerImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {originalBannerImages.map((_, index) => {
                  // Map carousel index to real image index (carousel index 1 = real index 0)
                  const isActive = (currentBannerIndex - 1) === index || 
                                   (currentBannerIndex === 0 && index === originalBannerImages.length - 1) ||
                                   (currentBannerIndex === bannerImages.length - 1 && index === 0)
                  return (
                    <button
                      key={index}
                      onClick={() => goToBanner(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6 animate-fade-in">
            {settings?.banner?.title || 'SJ Clothing'}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light mb-12 tracking-wide max-w-2xl mx-auto">
            {settings?.banner?.description || 'Discover timeless elegance and contemporary style'}
          </p>
          <Link
            to="/products"
            className="inline-block border-2 border-white text-white px-12 py-4 text-sm tracking-widest uppercase font-light hover:bg-white hover:text-black transition-all duration-300"
          >
            Explore Collection
          </Link>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Special Offer Banner - Elegant */}
      {settings?.specialOffer?.enabled && (
        <section className="bg-black text-white py-6 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm md:text-base tracking-widest uppercase font-light letter-spacing-wider">
              {settings.specialOffer.title || `Special Offer: ${settings.specialOffer.percentage}% OFF`}
            </p>
          </div>
        </section>
      )}

      {/* Featured Products - Luxury Layout */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-baseline mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black">Featured</h2>
            <Link
              to="/products?featured=true"
              className="text-sm tracking-widest uppercase font-light text-black border-b border-black/20 hover:border-black transition-colors duration-300"
            >
              View All
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-24 font-light">No featured products available</p>
          )}
        </div>
      </section>

      {/* New Arrivals - Full Width Elegant Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-baseline mb-16">
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black">New Arrivals</h2>
            <Link
              to="/products?newArrival=true"
              className="text-sm tracking-widest uppercase font-light text-black border-b border-black/20 hover:border-black transition-colors duration-300"
            >
              View All
            </Link>
          </div>
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {newArrivals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-24 font-light">No new arrivals available</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home

