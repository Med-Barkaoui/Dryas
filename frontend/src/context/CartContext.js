import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false); // Ajouté

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('dryas_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      updateCartStats(parsedCart);
    }
  }, []);

  // Mettre à jour localStorage quand le panier change
  useEffect(() => {
    localStorage.setItem('dryas_cart', JSON.stringify(cartItems));
    updateCartStats(cartItems);
  }, [cartItems]);

  const updateCartStats = (items) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartCount(count);
    setTotalAmount(total);
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.productId === product._id);
      
      if (existingItemIndex !== -1) {
        // Mise à jour de la quantité si le produit existe déjà
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Ajout d'un nouveau produit
        const newItem = {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.photos?.[0] || product.image || '',
          category: product.category,
          stock: product.stock
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.productId === productId);
  };

  // Fonctions pour ouvrir/fermer le panier
  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      totalAmount,
      isCartOpen, // Ajouté
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItem,
      openCart,    // Ajouté
      closeCart,   // Ajouté
      toggleCart   // Ajouté
    }}>
      {children}
    </CartContext.Provider>
  );
};