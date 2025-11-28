import { useState, useEffect } from 'react'
import api from '../config/api'
import toast from 'react-hot-toast'

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [JSON.stringify(filters)])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const response = await api.get(`/products?${params.toString()}`)
      setProducts(response.data)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
      
      // Only show toast for network errors once
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        // Check if we've already shown the error
        const hasShownError = sessionStorage.getItem('networkErrorShown')
        if (!hasShownError) {
          toast.error('Cannot connect to server. Make sure the backend is running on port 5007', {
            duration: 5000
          })
          sessionStorage.setItem('networkErrorShown', 'true')
        }
      } else {
        toast.error('Failed to load products')
      }
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, refetch: fetchProducts }
}

export default useProducts

