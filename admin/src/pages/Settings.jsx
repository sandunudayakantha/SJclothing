import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const Settings = () => {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    contact: {
      phone: '',
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
    }
  })
  const [existingBannerImage, setExistingBannerImage] = useState(null)
  const [bannerImage, setBannerImage] = useState(null)

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
        specialOffer: data.specialOffer || settings.specialOffer
      })
      if (data.banner?.image) {
        setExistingBannerImage(data.banner.image)
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

    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: type === 'checkbox' ? checked : value
      }
    }))
  }

  const handleBannerImageChange = (e) => {
    setBannerImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = new FormData()
      submitData.append('contact[phone]', settings.contact.phone)
      submitData.append('contact[email]', settings.contact.email)
      submitData.append('contact[address]', settings.contact.address)
      submitData.append('contact[whatsapp]', settings.contact.whatsapp)
      submitData.append('banner[title]', settings.banner.title)
      submitData.append('banner[description]', settings.banner.description)
      submitData.append('specialOffer[enabled]', settings.specialOffer.enabled)
      submitData.append('specialOffer[percentage]', settings.specialOffer.percentage)
      submitData.append('specialOffer[title]', settings.specialOffer.title)

      if (bannerImage) {
        submitData.append('bannerImage', bannerImage)
      }

      await api.put('/settings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Settings updated successfully')
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
                Phone
              </label>
              <input
                type="text"
                name="contact.phone"
                value={settings.contact.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
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
                WhatsApp Number
              </label>
              <input
                type="text"
                name="contact.whatsapp"
                value={settings.contact.whatsapp}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
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
            {existingBannerImage && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Current Banner Image</p>
                <img
                  src={`http://localhost:5007${existingBannerImage}`}
                  alt="Banner"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Banner Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
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

