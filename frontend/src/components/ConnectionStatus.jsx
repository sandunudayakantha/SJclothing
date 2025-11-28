import { useState, useEffect } from 'react'
import api from '../config/api'

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    checkConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkConnection = async () => {
    try {
      setChecking(true)
      const response = await api.get('/health')
      if (response.data.status === 'OK') {
        setIsConnected(true)
        sessionStorage.removeItem('networkErrorShown')
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      setIsConnected(false)
    } finally {
      setChecking(false)
    }
  }

  if (isConnected) return null

  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
      <p>
        ⚠️ Cannot connect to server. 
        {!checking && (
          <button 
            onClick={checkConnection}
            className="underline ml-2 hover:no-underline"
          >
            Retry
          </button>
        )}
        {checking && <span className="ml-2">Checking...</span>}
      </p>
      <p className="text-xs mt-1 opacity-90">
        Make sure the backend server is running on port 5007
      </p>
    </div>
  )
}

export default ConnectionStatus

