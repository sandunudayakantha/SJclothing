import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import Loading from '../components/Loading'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
        >
          Add New Product
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={`http://localhost:5007${product.images[0]}`}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{product.title}</p>
                        {product.featured && (
                          <span className="text-xs bg-black text-white px-2 py-1 rounded mr-1">Featured</span>
                        )}
                        {product.newArrival && (
                          <span className="text-xs bg-accent text-white px-2 py-1 rounded">New</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {product.category?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">${(product.discountPrice || product.price).toFixed(2)}</p>
                        {product.discountPrice && (
                          <p className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{product.stock}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
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
          <p className="text-gray-500 text-lg mb-4">No products found</p>
          <Link
            to="/admin/products/new"
            className="text-accent hover:underline font-semibold"
          >
            Add your first product
          </Link>
        </div>
      )}
    </div>
  )
}

export default Products

