import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getImageUrl } from '../config/api'
import Loading from '../components/Loading'

const CategoryForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    parent: ''
  })
  const [image, setImage] = useState(null)
  const [existingImage, setExistingImage] = useState(null)

  useEffect(() => {
    fetchCategories()
    if (id) {
      fetchCategory()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?includeSubcategories=true')
      // Filter out subcategories and the current category being edited
      setCategories(response.data.filter(cat => !cat.parent && cat._id !== id))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCategory = async () => {
    try {
      const response = await api.get(`/categories/${id}`)
      const category = response.data
      setFormData({
        name: category.name,
        parent: category.parent?._id || ''
      })
      if (category.image) {
        setExistingImage(category.image)
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      toast.error('Failed to fetch category')
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      if (formData.parent) {
        submitData.append('parent', formData.parent)
      }
      if (image) {
        submitData.append('image', image)
      }

      if (id) {
        await api.put(`/categories/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category updated successfully')
      } else {
        await api.post('/categories', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category created successfully')
      }
      
      navigate('/admin/categories')
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error.response?.data?.message || 'Failed to save category')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {id ? 'Edit Category' : 'Add New Category'}
      </h1>
      {id && formData.parent && (
        <p className="text-gray-600 mb-8">
          Editing subcategory under parent category
        </p>
      )}
      {!id && (
        <p className="text-gray-600 mb-8">
          Create a main category or subcategory
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Parent Category (Optional)
          </label>
          <select
            name="parent"
            value={formData.parent}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">None (Main Category)</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            {id && formData.parent 
              ? 'Change parent category or leave empty to make it a main category'
              : 'Select a parent category to make this a subcategory. You can have the same subcategory name under different parents.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category Image
          </label>
          {existingImage && (
            <div className="mb-4">
              <img
                src={getImageUrl(existingImage)}
                alt="Current"
                className="w-32 h-32 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/128x128?text=No+Image'
                }}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            {id ? 'Update Category' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm

