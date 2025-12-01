import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../config/api'
import Loading from '../components/Loading'

const Settings = () => {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    contact: {
      phone: '',
      callPhone: '',
      email: '',
      address: '',
      whatsapp: ''
    },
    banner: {
      image: null,
      title: '',
      description: ''
    },
    specialOffer: {
      enabled: false,
      percentage: 0,
      title: ''
    },
    deliveryFee: 0
  })
  const [existingBannerImages, setExistingBannerImages] = useState([])
  const [bannerImages, setBannerImages] = useState([])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      const data = response.data
      setSettings({
        contact: data.contact || settings.contact,
        banner: data.banner || settings.banner,
        specialOffer: data.specialOffer || settings.specialOffer,
        deliveryFee: data.deliveryFee || 0
      })
      // Handle both single image (backward compatibility) and multiple images
      if (data.banner?.images && Array.isArray(data.banner.images) && data.banner.images.length > 0) {
        setExistingBannerImages(data.banner.images)
      } else if (data.banner?.image) {
        setExistingBannerImages([data.banner.image])
      } else {
        setExistingBannerImages([])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const [section, field] = name.split('.')

    if (name === 'deliveryFee') {
      setSettings(prev => ({
        ...prev,
        deliveryFee: parseFloat(value) || 0
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }))
    }
  }

  const handleBannerImagesChange = (e) => {
    const files = Array.from(e.target.files)
    setBannerImages(files)
  }

  const handleDeleteBannerImage = (imageToDelete) => {
    setExistingBannerImages(prev => prev.filter(img => img !== imageToDelete))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = new FormData()
      submitData.append('contact[phone]', settings.contact.phone)
      submitData.append('contact[callPhone]', settings.contact.callPhone)
      submitData.append('contact[email]', settings.contact.email)
      submitData.append('contact[address]', settings.contact.address)
      submitData.append('contact[whatsapp]', settings.contact.whatsapp)
      submitData.append('banner[title]', settings.banner.title)
      submitData.append('banner[description]', settings.banner.description)
      submitData.append('specialOffer[enabled]', settings.specialOffer.enabled)
      submitData.append('specialOffer[percentage]', settings.specialOffer.percentage)
      submitData.append('specialOffer[title]', settings.specialOffer.title)
      submitData.append('deliveryFee', settings.deliveryFee)

      // Append multiple banner images
      bannerImages.forEach((file, index) => {
        submitData.append('bannerImages', file)
      })

      // Append images to delete
      const currentImages = existingBannerImages
      const originalImages = settings.banner?.images || (settings.banner?.image ? [settings.banner.image] : [])
      const imagesToDelete = originalImages.filter(img => !currentImages.includes(img))
      imagesToDelete.forEach(img => {
        submitData.append('bannerImagesToDelete', img)
      })

      await api.put('/settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Settings updated successfully')
      setBannerImages([]) // Clear new images after upload
      fetchSettings()
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Store Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-8">
        {/* Contact Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone (General)
              </label>
              <input
                type="text"
                name="contact.phone"
                value={settings.contact.phone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Call Phone Number *
              </label>
              <input
                type="text"
                name="contact.callPhone"
                value={settings.contact.callPhone}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-gray-500 mt-1">This number will be used for the Call button</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="contact.email"
                value={settings.contact.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="text"
                name="contact.whatsapp"
                value={settings.contact.whatsapp}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-gray-500 mt-1">This number will be used for the WhatsApp button</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address
              </label>
              <textarea
                name="contact.address"
                value={settings.contact.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Banner Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Banner Settings</h2>
          <div className="space-y-6">
            {existingBannerImages.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-4">Current Banner Images ({existingBannerImages.length})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {existingBannerImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageUrl(image)}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x256?text=No+Image'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteBannerImage(image)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Add Banner Images (Multiple selection allowed)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBannerImagesChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple images. They will be displayed in a carousel on the homepage.</p>
              {bannerImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-2">New images to upload: {bannerImages.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {bannerImages.map((file, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Banner Title
              </label>
              <input
                type="text"
                name="banner.title"
                value={settings.banner.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Banner Description
              </label>
              <textarea
                name="banner.description"
                value={settings.banner.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Delivery Fee ($)
              </label>
              <input
                type="number"
                name="deliveryFee"
                value={settings.deliveryFee}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-gray-500 mt-1">Default delivery fee for products without free delivery</p>
            </div>
          </div>
        </div>

        {/* Special Offer Settings */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Special Offer</h2>
          <div className="space-y-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="specialOffer.enabled"
                checked={settings.specialOffer.enabled}
                onChange={handleChange}
                className="w-4 h-4 text-accent focus:ring-accent"
              />
              <span className="text-sm font-semibold text-gray-900">Enable Special Offer</span>
            </label>
            {settings.specialOffer.enabled && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    name="specialOffer.percentage"
                    value={settings.specialOffer.percentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Offer Title
                  </label>
                  <input
                    type="text"
                    name="specialOffer.title"
                    value={settings.specialOffer.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Sale - 20% OFF!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Save Settings
        </button>
      </form>
    </div>
  )
}

export default Settings

