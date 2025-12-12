import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin, Phone, User, Mail, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: localStorage.getItem('dryas_email') || '',
    address: 'Tunis, Tunisia',
    phone: '+216 12 345 678',
    paymentMethod: 'cash' // cash ou card
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleBack = () => {
    navigate('/panier');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmOrder = async () => {
    if (!userInfo.fullName || !userInfo.phone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (cartItems.length === 0) {
      alert('Votre panier est vide!');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customerInfo: userInfo,
        items: cartItems,
        totalAmount: totalAmount,
        status: 'pending',
        orderDate: new Date().toISOString()
      };

      // Envoyer la commande à l'API
      const response = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dryas_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setOrderId(response.data.order._id);
        setOrderConfirmed(true);
        clearCart();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToShop = () => {
    navigate('/boutique');
  };

  const handleViewOrders = () => {
    navigate('/commandes');
  };

  if (orderConfirmed) {
    return (
      <div className="checkout-page">
        <nav className="dryas-navbar">
          <div className="nav-left">
            <div className="logo">Dryas</div>
          </div>
        </nav>

        <div className="order-confirmed">
          <div className="confirmation-icon">
            <CheckCircle size={80} color="#4a7c59" />
          </div>
          <h1>Commande Confirmée!</h1>
          <p className="order-id">Référence: #{orderId}</p>
          <p className="confirmation-message">
            Votre commande a été enregistrée avec succès. 
            Vous recevrez une confirmation par email.
          </p>
          
          <div className="order-summary">
            <h3>Récapitulatif de la commande</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span>Montant total:</span>
                <span>TND{totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Articles:</span>
                <span>{cartItems.length} produit(s)</span>
              </div>
              <div className="summary-item">
                <span>Mode de paiement:</span>
                <span>{userInfo.paymentMethod === 'cash' ? 'Paiement à la livraison' : 'Carte bancaire'}</span>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <button onClick={handleBackToShop} className="back-to-shop-btn">
              Retour à la boutique
            </button>
            <button onClick={handleViewOrders} className="view-orders-btn">
              Voir mes commandes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <nav className="dryas-navbar">
        <div className="nav-left">
          <button onClick={handleBack} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="logo">Dryas</div>
        </div>
        <div className="nav-center">
          <h2 className="checkout-title">Confirmation de commande</h2>
        </div>
        <div className="nav-right"></div>
      </nav>

      <hr />

      <div className="checkout-container">
        <div className="checkout-content">
          {/* Informations client */}
          <div className="customer-info-section">
            <h2><User size={24} /> Informations personnelles</h2>
            
            <div className="form-group">
              <label>Nom complet *</label>
              <input
                type="text"
                name="fullName"
                value={userInfo.fullName}
                onChange={handleInputChange}
                placeholder="Votre nom complet"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userInfo.email}
                onChange={handleInputChange}
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Téléphone *</label>
              <input
                type="tel"
                name="phone"
                value={userInfo.phone}
                onChange={handleInputChange}
                placeholder="+216 12 345 678"
                required
              />
            </div>

            <div className="form-group">
              <label><MapPin size={16} /> Adresse de livraison *</label>
              <textarea
                name="address"
                value={userInfo.address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Votre adresse complète"
                required
              />
            </div>
          </div>

          {/* Récapitulatif de la commande */}
          <div className="order-summary-section">
            <h2><CreditCard size={24} /> Récapitulatif</h2>
            
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.productId} className="order-item">
                  <div className="order-item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <span className="item-total">
                    TND{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-line">
                <span>Sous-total</span>
                <span>TND{totalAmount.toFixed(2)}</span>
              </div>
              <div className="total-line">
                <span>Livraison</span>
                <span className="free">Gratuite</span>
              </div>
              <div className="total-line grand-total">
                <span>Total à payer</span>
                <span className="grand-total-amount">TND{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-method">
              <h3>Mode de paiement</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={userInfo.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                  />
                  <span>Paiement à la livraison</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={userInfo.paymentMethod === 'card'}
                    onChange={handleInputChange}
                  />
                  <span>Carte bancaire</span>
                </label>
              </div>
            </div>

            <button 
              onClick={handleConfirmOrder} 
              className="confirm-order-btn"
              disabled={loading}
            >
              {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
            </button>

            <p className="secure-notice">
              🔒 Paiement sécurisé - Vos informations sont protégées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;