import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const ColorForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    hexCode: '#000000',
    category: '',
    order: 0
  })

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchColor()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchColor = async () => {
    try {
      const response = await api.get(`/colors/${id}`)
      const color = response.data
      setFormData({
        name: color.name,
        displayName: color.displayName,
        hexCode: color.hexCode || '#000000',
        category: color.category?._id || '',
        order: color.order || 0
      })
    } catch (error) {
      console.error('Error fetching color:', error)
      toast.error('Failed to fetch color')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = {
        ...formData,
        category: formData.category || null,
        order: parseInt(formData.order) || 0
      }

      if (id) {
        await api.put(`/colors/${id}`, submitData)
        toast.success('Color updated successfully')
      } else {
        await api.post('/colors', submitData)
        toast.success('Color created successfully')
      }
      
      navigate('/admin/colors')
    } catch (error) {
      console.error('Error saving color:', error)
      toast.error(error.response?.data?.message || 'Failed to save color')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {id ? 'Edit Color' : 'Add New Color'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Color Name (Code) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., red, blue, green, black"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">This will be stored in lowercase (e.g., red, blue, green)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
            placeholder="e.g., Red, Blue, Green, Black"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">This is how the color will be displayed to customers</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Hex Color Code
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              name="hexCode"
              value={formData.hexCode}
              onChange={handleChange}
              className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              name="hexCode"
              value={formData.hexCode}
              onChange={handleChange}
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              placeholder="#000000"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Choose a color or enter hex code (e.g., #FF0000 for red)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category (Optional)
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Categories (Default)</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Leave empty to make this color available for all categories</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">Lower numbers appear first (0, 1, 2, ...)</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            {id ? 'Update Color' : 'Create Color'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/colors')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ColorForm

