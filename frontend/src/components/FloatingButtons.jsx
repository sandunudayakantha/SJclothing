import { useState, useEffect } from 'react'
import api from '../config/api'

const FloatingButtons = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
      // Debug logging
      console.log('Settings loaded:', {
        whatsapp: response.data?.contact?.whatsapp,
        callPhone: response.data?.contact?.callPhone
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppClick = () => {
    if (!settings?.contact?.whatsapp) {
      alert('WhatsApp number not configured')
      return
    }
    // Remove all non-digit characters for WhatsApp (wa.me requires digits only)
    const phoneNumber = settings.contact.whatsapp.replace(/\D/g, '')
    if (!phoneNumber) {
      alert('Invalid WhatsApp number')
      return
    }
    const whatsappUrl = `https://wa.me/${phoneNumber}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCallClick = () => {
    if (!settings?.contact?.callPhone) {
      alert('Call number not configured')
      return
    }
    // Use tel: protocol for phone calls (can include + sign)
    const phoneNumber = settings.contact.callPhone.replace(/[^\d+]/g, '')
    if (!phoneNumber) {
      alert('Invalid phone number')
      return
    }
    window.location.href = `tel:${phoneNumber}`
  }

  if (loading || !settings) {
    return null
  }

  const hasWhatsApp = settings.contact?.whatsapp && settings.contact.whatsapp.trim() !== ''
  const hasCallPhone = settings.contact?.callPhone && settings.contact.callPhone.trim() !== ''

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('FloatingButtons visibility:', {
      hasWhatsApp,
      hasCallPhone,
      whatsapp: settings.contact?.whatsapp,
      callPhone: settings.contact?.callPhone
    })
  }

  if (!hasWhatsApp && !hasCallPhone) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Button */}
      {hasWhatsApp && (
        <div className="relative group">
          <button
            onClick={handleWhatsAppClick}
            className="bg-[#25D366] text-white p-4 md:p-5 rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 flex items-center justify-center animate-pulse hover:animate-none"
            title="Chat on WhatsApp"
            aria-label="WhatsApp"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </button>
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat on WhatsApp
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
      )}

      {/* Call Button */}
      {hasCallPhone && (
        <div className="relative group">
          <button
            onClick={handleCallClick}
            className="bg-accent text-white p-4 md:p-5 rounded-full shadow-2xl hover:bg-opacity-90 transition-all duration-300 hover:scale-110 flex items-center justify-center ring-2 ring-white"
            title={`Call ${settings.contact.callPhone}`}
            aria-label="Call"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Call us
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingButtons

