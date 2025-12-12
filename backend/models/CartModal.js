import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, MapPin, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const CartModal = () => {
  const { 
    cartItems, 
    cartCount, 
    totalAmount,
    removeFromCart, 
    updateQuantity,
    closeCart,
    clearCart 
  } = useCart();
  
  const [userInfo, setUserInfo] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("dryas_token");
      if (!token) return;

      try {
        const res = await axios.get("/api/auth/check-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(res.data.user);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("dryas_token");
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: totalAmount,
        totalItems: cartCount,
        user: {
          email: userInfo?.email,
          address: userInfo?.address || '',
          phone: userInfo?.phone || ''
        },
        status: 'pending',
        orderDate: new Date().toISOString()
      };

      const response = await axios.post('/api/orders/create', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Commande confirmée avec succès!');
        clearCart();
        closeCart();
        // Optionnel: rediriger vers la page des commandes
        // navigate('/commandes');
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation de la commande:', error);
      alert('Erreur lors de la confirmation de la commande');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-overlay" onClick={closeCart}>
        <div className="cart-container" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <button onClick={closeCart} className="back-to-catalog">
              ← Retour au catalogue
            </button>
            <h2>Votre Panier</h2>
            <button onClick={closeCart} className="close-cart">
              <X size={24} />
            </button>
          </div>
          <div className="empty-cart">
            <ShoppingBag size={64} />
            <h3>Votre panier est vide</h3>
            <p>Ajoutez des plantes pour commencer vos achats</p>
            <button onClick={closeCart} className="browse-btn">
              Parcourir la boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cart-overlay" onClick={closeCart}>
        <div className="cart-container" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <button onClick={closeCart} className="back-to-catalog">
              ← Retour au catalogue
            </button>
            <h2>Votre Panier ({cartCount} {cartCount > 1 ? 'articles' : 'article'})</h2>
            <button onClick={closeCart} className="close-cart">
              <X size={24} />
            </button>
          </div>

          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80?text=Image';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-price">TND {item.price?.toFixed(2) || '0.00'} l'unité</p>
                  {item.stock && (
                    <p className="item-stock">
                      Stock: {item.stock} disponible{item.stock > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="qty-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="qty-btn"
                    disabled={item.stock && item.quantity >= item.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="item-total">
                  TND {(item.price * item.quantity).toFixed(2)}
                </div>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="remove-item"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Total articles:</span>
              <span>{cartCount}</span>
            </div>
            <div className="summary-row total">
              <span>Montant total:</span>
              <span className="total-price">TND {totalAmount.toFixed(2)}</span>
            </div>

            {userInfo && (
              <div className="user-info-section">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{userInfo.address || 'Adresse non renseignée'}</span>
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <span>{userInfo.phone || 'Téléphone non renseigné'}</span>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowConfirmation(true)}
              className="confirm-order-btn"
            >
              Confirmer la commande
            </button>
          </div>
        </div>
      </div>

      {/* Popup de confirmation */}
      {showConfirmation && (
        <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer la commande</h3>
            
            <div className="order-summary">
              <h4>Récapitulatif de la commande</h4>
              {cartItems.map(item => (
                <div key={item.productId} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>TND {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-total">
                <strong>Total:</strong>
                <strong>TND {totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="order-details">
              <h4>Informations de livraison</h4>
              <p><strong>Email:</strong> {userInfo?.email}</p>
              <p><strong>Adresse:</strong> {userInfo?.address || 'Non renseignée'}</p>
              <p><strong>Téléphone:</strong> {userInfo?.phone || 'Non renseigné'}</p>
            </div>

            <div className="confirmation-buttons">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="cancel-btn"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmOrder}
                className="confirm-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer la commande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartModal;