import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?includeSubcategories=true')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Link
          to="/admin/categories/new"
          className="bg-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Add New Category
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-4">
          {/* Main Categories */}
          {categories.filter(cat => !cat.parent).map(category => (
            <div key={category._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                    {category.parent && (
                      <p className="text-sm text-gray-500">Parent: {category.parent.name}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/categories/edit/${category._id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Subcategories:</h4>
                  <div className="space-y-2">
                    {category.subcategories.map(sub => {
                      // Handle both populated and non-populated subcategories
                      const subId = typeof sub === 'object' ? sub._id : sub;
                      const subName = typeof sub === 'object' ? sub.name : 'Loading...';
                      
                      return (
                        <div
                          key={subId}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <span className="text-gray-900 font-medium">{subName}</span>
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/categories/edit/${subId}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-2 py-1 hover:bg-blue-50 rounded"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(subId)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm px-2 py-1 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No categories found</p>
          <Link
            to="/admin/categories/new"
            className="text-accent hover:underline font-semibold"
          >
            Add your first category
          </Link>
        </div>
      )}
    </div>
  )
}

export default Categories

