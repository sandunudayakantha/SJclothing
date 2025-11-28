import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sjclothing_cart')
    const savedWishlist = localStorage.getItem('sjclothing_wishlist')
    
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sjclothing_cart', JSON.stringify(cart))
  }, [cart])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sjclothing_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToCart = (product, size, color, quantity = 1) => {
    // Check stock availability
    if (product.stock === 0) {
      throw new Error('Product is out of stock')
    }

    const item = {
      product: product._id,
      productData: product,
      size,
      color,
      quantity: parseInt(quantity),
      price: product.discountPrice || product.price
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.product === product._id && item.size === size && item.color === color
      )

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          throw new Error(`Only ${product.stock} items available`)
        }
        return prevCart.map(item =>
          item.product === product._id && item.size === size && item.color === color
            ? { ...item, quantity: newQuantity }
            : item
        )
      }

      return [...prevCart, item]
    })
  }

  const removeFromCart = (productId, size, color) => {
    setCart(prevCart =>
      prevCart.filter(
        item => !(item.product === productId && item.size === size && item.color === color)
      )
    )
  }

  const updateCartQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product === productId && item.size === size && item.color === color) {
          // Check stock if product data is available
          const maxQuantity = item.productData?.stock || Infinity
          const newQuantity = Math.min(parseInt(quantity), maxQuantity)
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const addToWishlist = (product) => {
    setWishlist(prevWishlist => {
      if (prevWishlist.find(item => item._id === product._id)) {
        return prevWishlist
      }
      return [...prevWishlist, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlist(prevWishlist =>
      prevWishlist.filter(item => item._id !== productId)
    )
  }

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId)
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

