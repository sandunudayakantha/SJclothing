import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const Colors = () => {
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      const response = await api.get('/colors')
      setColors(response.data)
    } catch (error) {
      console.error('Error fetching colors:', error)
      toast.error('Failed to fetch colors')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this color?')) {
      return
    }

    try {
      await api.delete(`/colors/${id}`)
      toast.success('Color deleted successfully')
      fetchColors()
    } catch (error) {
      console.error('Error deleting color:', error)
      toast.error(error.response?.data?.message || 'Failed to delete color')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Colors</h1>
        <Link
          to="/admin/colors/new"
          className="bg-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Add New Color
        </Link>
      </div>

      {colors.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Color</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Display Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {colors.map(color => (
                  <tr key={color._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-sm text-gray-600">{color.hexCode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 capitalize">{color.name}</td>
                    <td className="py-3 px-4 text-gray-700">{color.displayName}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {color.category ? color.category.name : 'All Categories'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{color.order}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/colors/edit/${color._id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(color._id)}
                          className="text-red-600 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">No colors found</p>
          <Link
            to="/admin/colors/new"
            className="text-accent hover:underline font-semibold"
          >
            Add your first color
          </Link>
        </div>
      )}
    </div>
  )
}

export default Colors

