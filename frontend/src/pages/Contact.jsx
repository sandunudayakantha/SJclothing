import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const Contact = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    honeypot: '' // Honeypot field for spam prevention
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await api.post('/settings/contact', formData)
      toast.success('Message sent successfully!')
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        honeypot: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send message. Please try again.'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  const whatsappLink = settings?.contact?.whatsapp
    ? `https://wa.me/${settings.contact.whatsapp.replace(/[^0-9]/g, '')}`
    : '#'

  return (
    <div className="w-full">
      {/* Hero Header Section */}
      <section className="bg-black text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-light tracking-wide max-w-2xl">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-12">Get in Touch</h2>
          
              <div className="space-y-8">
                {settings?.contact?.phone && (
                  <div className="flex items-start gap-6">
                    <div className="bg-black text-white p-4 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-light tracking-widest uppercase text-black/60 mb-2">Phone</h3>
                      <a href={`tel:${settings.contact.phone}`} className="text-base font-light text-black hover:text-black/70 transition-colors duration-300">
                        {settings.contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.contact?.email && (
                  <div className="flex items-start gap-6">
                    <div className="bg-black text-white p-4 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-light tracking-widest uppercase text-black/60 mb-2">Email</h3>
                      <a href={`mailto:${settings.contact.email}`} className="text-base font-light text-black hover:text-black/70 transition-colors duration-300">
                        {settings.contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.contact?.address && (
                  <div className="flex items-start gap-6">
                    <div className="bg-black text-white p-4 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-light tracking-widest uppercase text-black/60 mb-2">Address</h3>
                      <p className="text-base font-light text-black leading-relaxed">{settings.contact.address}</p>
                    </div>
                  </div>
                )}

                {settings?.contact?.whatsapp && (
                  <div>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 border-2 border-black text-black px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black hover:text-white transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Chat on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-12">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-widest uppercase font-light text-black/60 mb-3">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-6 py-3 border border-black/20 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors duration-300 font-light tracking-wide resize-none"
                    placeholder="Your message..."
                  />
                </div>

                {/* Honeypot field - hidden from users but visible to bots */}
                <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
                  <label htmlFor="website">Website (leave blank)</label>
                  <input
                    type="text"
                    id="website"
                    name="honeypot"
                    tabIndex="-1"
                    autoComplete="off"
                    value={formData.honeypot || ''}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full border-2 border-black text-black px-8 py-4 text-sm tracking-widest uppercase font-light hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact

