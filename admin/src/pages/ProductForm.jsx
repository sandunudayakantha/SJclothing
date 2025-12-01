import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [availableSizes, setAvailableSizes] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [availableColors, setAvailableColors] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    discountPrice: '',
    sizes: '',
    colors: '',
    stock: '',
    featured: false,
    newArrival: false,
    freeDelivery: false
  })
  const [images, setImages] = useState([])
  const [newImages, setNewImages] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchSizes()
    fetchColors()
    if (id) {
      fetchProduct()
    }
  }, [id])

  // Load subcategories when categories are fetched and a category is selected
  useEffect(() => {
    if (categories.length > 0 && formData.category) {
      loadSubcategories(formData.category)
    } else if (!formData.category) {
      // Clear subcategories if no category is selected
      setSubcategories([])
    }
  }, [categories, formData.category])

  // Load sizes when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSizes(formData.category)
    } else {
      fetchSizes()
    }
  }, [formData.category])

  // Load colors when category changes
  useEffect(() => {
    if (formData.category) {
      fetchColors(formData.category)
    } else {
      fetchColors()
    }
  }, [formData.category])

  const loadSubcategories = (categoryId) => {
    if (!categoryId || categories.length === 0) {
      setSubcategories([])
      return
    }
    
    const selectedCategory = categories.find(cat => cat._id === categoryId)
    
    // Check if subcategories exist, are an array, have length > 0, and are populated objects
    if (selectedCategory && 
        Array.isArray(selectedCategory.subcategories) && 
        selectedCategory.subcategories.length > 0) {
      // Filter to ensure we only have valid subcategory objects (not just ObjectIds)
      const validSubcategories = selectedCategory.subcategories.filter(
        sub => sub && typeof sub === 'object' && sub._id && sub.name
      )
      
      if (validSubcategories.length > 0) {
        setSubcategories(validSubcategories)
        return
      }
    }
    
    // No valid subcategories found - clear the array
    setSubcategories([])
  }

  const fetchCategories = async () => {
    try {
      // Fetch all categories with subcategories populated for admin
      const response = await api.get('/categories?includeSubcategories=true')
      // Filter to only main categories for the dropdown (subcategories are shown separately)
      const mainCategories = response.data.filter(cat => !cat.parent)
      setCategories(mainCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSizes = async (categoryId = null) => {
    try {
      // Fetch all sizes - the backend will filter to show category-specific and global sizes
      const params = categoryId ? { category: categoryId } : {}
      const response = await api.get('/sizes', { params })
      setAvailableSizes(response.data)
      
      // If editing and sizes are already selected, make sure they're still in selectedSizes
      // This handles cases where a size might have been removed from the system
      if (id && selectedSizes.length > 0) {
        const availableSizeNames = response.data.map(s => s.name)
        setSelectedSizes(prev => prev.filter(size => availableSizeNames.includes(size)))
      }
    } catch (error) {
      console.error('Error fetching sizes:', error)
    }
  }

  const fetchColors = async (categoryId = null) => {
    try {
      // Fetch all colors - the backend will filter to show category-specific and global colors
      const params = categoryId ? { category: categoryId } : {}
      const response = await api.get('/colors', { params })
      setAvailableColors(response.data)
      
      // If editing and colors are already selected, make sure they're still in selectedColors
      // This handles cases where a color might have been removed from the system
      if (id && selectedColors.length > 0) {
        const availableColorNames = response.data.map(c => c.name)
        setSelectedColors(prev => prev.filter(color => availableColorNames.includes(color)))
      }
    } catch (error) {
      console.error('Error fetching colors:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`)
      const product = response.data
      const categoryId = product.category._id
      
      // Set selected sizes and colors from product
      setSelectedSizes(product.sizes || [])
      setSelectedColors(product.colors || [])
      
      setFormData({
        title: product.title,
        description: product.description,
        category: categoryId,
        subcategory: product.subcategory || '',
        price: product.price,
        discountPrice: product.discountPrice || '',
        sizes: product.sizes.join(', '), // Keep for backward compatibility
        colors: product.colors.join(', '),
        stock: product.stock,
        featured: product.featured,
        newArrival: product.newArrival,
        freeDelivery: product.freeDelivery || false
      })
      setImages(product.images || [])
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const handleSizeToggle = (sizeName) => {
    setSelectedSizes(prev => {
      if (prev.includes(sizeName)) {
        return prev.filter(s => s !== sizeName)
      } else {
        return [...prev, sizeName]
      }
    })
  }

  const handleColorToggle = (colorName) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName)
      } else {
        return [...prev, colorName]
      }
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // When category changes, clear subcategories and subcategory selection
    if (name === 'category') {
      setSubcategories([]) // Clear immediately to prevent showing stale data
      setFormData({
        ...formData,
        category: value,
        subcategory: '' // Clear subcategory when category changes
      })
      // loadSubcategories will be called by the useEffect when formData.category changes
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate sizes and colors
    if (selectedSizes.length === 0) {
      toast.error('Please select at least one size')
      return
    }
    if (selectedColors.length === 0) {
      toast.error('Please select at least one color')
      return
    }
    
    try {
      const submitData = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'sizes' && key !== 'colors' && formData[key] !== '' && formData[key] !== null) {
          submitData.append(key, formData[key])
        }
      })

      // Add selected sizes and colors
      submitData.append('sizes', selectedSizes.join(', '))
      submitData.append('colors', selectedColors.join(', '))

      newImages.forEach(file => {
        submitData.append('images', file)
      })

      if (id) {
        await api.put(`/products/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product created successfully')
      }
      
      navigate('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(error.response?.data?.message || 'Failed to save product')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {id ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Subcategory
            </label>
            {formData.category && Array.isArray(subcategories) && subcategories.length > 0 && subcategories.some(sub => sub && sub._id && sub.name) ? (
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select Subcategory (Optional)</option>
                {subcategories.filter(sub => sub && sub._id && sub.name).map(sub => (
                  <option key={sub._id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            ) : formData.category ? (
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="No subcategories available. Enter custom subcategory name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            ) : (
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="Select a category first"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            )}
            {formData.category && Array.isArray(subcategories) && subcategories.length > 0 && subcategories.some(sub => sub && sub._id && sub.name) && (
              <p className="text-xs text-gray-500 mt-1">
                Select a subcategory or leave empty
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Discount Price
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Sizes *
            </label>
            {availableSizes.length > 0 ? (
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSizes.map(size => (
                    <label
                      key={size._id}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size.name)}
                        onChange={() => handleSizeToggle(size.name)}
                        className="w-4 h-4 text-accent focus:ring-accent"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {size.displayName}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedSizes.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">Please select at least one size</p>
                )}
                {selectedSizes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedSizes.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  No sizes available. Please create sizes first.
                </p>
                <Link
                  to="/admin/sizes/new"
                  className="text-accent hover:underline font-semibold text-sm"
                >
                  Go to Sizes Management →
                </Link>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Colors *
            </label>
            {availableColors.length > 0 ? (
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {availableColors.map(color => (
                    <label
                      key={color._id}
                      className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color.name)}
                        onChange={() => handleColorToggle(color.name)}
                        className="w-4 h-4 text-accent focus:ring-accent"
                      />
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {color.displayName}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedColors.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">Please select at least one color</p>
                )}
                {selectedColors.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedColors.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  No colors available. Please create colors first.
                </p>
                <Link
                  to="/admin/colors/new"
                  className="text-accent hover:underline font-semibold text-sm"
                >
                  Go to Colors Management →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Images {!id && '*'}
          </label>
          {id && images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={`http://localhost:5007${img}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            required={!id}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-sm text-gray-500 mt-2">You can select multiple images</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-accent focus:ring-accent"
            />
            <span className="text-sm font-semibold text-gray-900">Featured Product</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="newArrival"
              checked={formData.newArrival}
              onChange={handleChange}
              className="w-4 h-4 text-accent focus:ring-accent"
            />
            <span className="text-sm font-semibold text-gray-900">New Arrival</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="freeDelivery"
              checked={formData.freeDelivery}
              onChange={handleChange}
              className="w-4 h-4 text-accent focus:ring-accent"
            />
            <span className="text-sm font-semibold text-gray-900">Free Delivery</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            {id ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm

