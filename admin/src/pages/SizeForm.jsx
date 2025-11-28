import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const SizeForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    category: '',
    order: 0
  })

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchSize()
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

  const fetchSize = async () => {
    try {
      const response = await api.get(`/sizes/${id}`)
      const size = response.data
      setFormData({
        name: size.name,
        displayName: size.displayName,
        category: size.category?._id || '',
        order: size.order || 0
      })
    } catch (error) {
      console.error('Error fetching size:', error)
      toast.error('Failed to fetch size')
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
        await api.put(`/sizes/${id}`, submitData)
        toast.success('Size updated successfully')
      } else {
        await api.post('/sizes', submitData)
        toast.success('Size created successfully')
      }
      
      navigate('/admin/sizes')
    } catch (error) {
      console.error('Error saving size:', error)
      toast.error(error.response?.data?.message || 'Failed to save size')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {id ? 'Edit Size' : 'Add New Size'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Size Name (Code) *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., S, M, L, XL, 42, 10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">This will be stored in uppercase (e.g., S, M, L)</p>
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
            placeholder="e.g., Small, Medium, Large, Extra Large"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-gray-500 mt-1">This is how the size will be displayed to customers</p>
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
          <p className="text-xs text-gray-500 mt-1">Leave empty to make this size available for all categories</p>
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
            {id ? 'Update Size' : 'Create Size'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/sizes')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default SizeForm

