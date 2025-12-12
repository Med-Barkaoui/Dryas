import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import axios from 'axios';
import { Trash2, ArrowLeft, Check } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger les articles du panier
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    // Charger les informations de l'utilisateur
    const token = localStorage.getItem('dryas_token');
    if (token) {
      axios.get('/api/auth/check-token', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setUserInfo(response.data.user);
        setShippingAddress(response.data.user.address || '');
        setPhoneNumber(response.data.user.phone || '');
      })
      .catch(error => {
        console.error('Erreur lors du chargement des infos utilisateur:', error);
      });
    }
  }, []);

  const handleRemoveItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        if (newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        } else {
          return item;
        }
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotals = () => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum +8+ (item.price * item.quantity), 0);
    return { totalItems, totalAmount: totalAmount.toFixed(2) };
  };

  const handleConfirmOrder = () => {
    setShowConfirmModal(true);
  };

  const handleSubmitOrder = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('dryas_token');
    const { totalAmount } = calculateTotals();

    const orderData = {
      products: cartItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: parseFloat(totalAmount),
      shippingAddress: shippingAddress,
      phone: phoneNumber
    };

    const response = await axios.post('/api/orders', orderData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      // Vider le panier après confirmation
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Afficher un message de succès
      alert('🎉 Commande confirmée avec succès !\n\nUn email de confirmation avec votre facture vous a été envoyé.');
      
      setShowConfirmModal(false);
      navigate('/commandes');
    }
  } catch (error) {
    console.error('Erreur lors de la confirmation de la commande:', error);
    alert(`Erreur lors de la confirmation de la commande: ${error.response?.data?.message || 'Erreur serveur'}`);
  } finally {
    setLoading(false);
  }
};






  const { totalItems, totalAmount } = calculateTotals();

  return (
    <div className="cart-page2">
      <Navbar />
      
      <div className="cart-container2">
        {/* En-tête avec flèche de retour */}
        <div className="cart-header2">
          <button 
            onClick={() => navigate('/home')} 
            className="back-to-catalog-btn2"
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Mon Panier</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart2">
            <p>Votre panier est vide</p>
            <button 
              onClick={() => navigate('/home')}
              className="continue-shopping-btn2"
            >
              Continuer vos achats
            </button>
          </div>
        ) : (
          <>
            {/* Liste des articles */}
            <div className="cart-items-section2">
              <div className="cart-items-header2">
                <span>Produit</span>
                <span>Prix unitaire</span>
                <span>Quantité</span>
                <span>Total</span>
                <span>Action</span>
              </div>
              
              <div className="cart-items-list2">
                {cartItems.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="product-info2">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="product-image2"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=Image';
                        }}
                      />
                      <div className="product-details2">
                        <h3>{item.name}</h3>
                        <p className="stock-info">Stock disponible: {item.stock}</p>
                      </div>
                    </div>
                    
                    <div className="unit-price">
                      TND{item.price.toFixed(2)}
                    </div>
                    
                    <div className="quantity-control">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="qty-btn2"
                      >
                        -
                      </button>
                      <span className="qty-value2">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="qty-btn2"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="item-total">
                      TND{(item.price * item.quantity).toFixed(2)}
                    </div>
                    
                    <div className="item-action">
                      <button 
                        onClick={() => handleRemoveItem(item.productId)}
                        className="remove-btn2"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="cart-summary-section2">
              <div className="summary-card2">
                <h2>Récapitulatif de la commande</h2>
                <div className="summary-row2">
                  <span>Frai de Livraison Inclus Déjà:</span>
                  <span>TND 8 </span>
                </div>
                <div className="summary-row2">
                  <span>Articles:</span>
                  <span>{totalItems} article(s)</span>
                </div>
                
                <div className="summary-row2 total-row2">
                  <span>Montant total:</span>
                  <span className="total-amount2">TND{totalAmount}</span>
                </div>

                {/* Informations utilisateur */}
                <div className="user-info-section2">
                  <h3>Informations de livraison</h3>
                  
                  <div className="info-field2">
                    <label>Adresse de livraison:</label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Entrez votre adresse complète"
                      className="address-input2"
                    />
                  </div>
                  
                  <div className="info-field2">
                    <label>Téléphone:</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Entrez votre numéro de téléphone"
                      className="phone-input2"
                    />
                  </div>
                  
                  {userInfo && (
                    <div className="user-details2">
                      <p><strong>Client:</strong> {userInfo.email}</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleConfirmOrder}
                  className="confirm-order-btn2"
                  disabled={!shippingAddress || !phoneNumber}
                >
                  <Check size={20} />
                  Confirmer la commande
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmation */}
      {showConfirmModal && (
        <div className="modal-overlay2">
          <div className="confirm-modal2">
            <h2>Confirmation de commande</h2>
            
            <div className="modal-content">
              <div className="order-summary2">
                <h3>Récapitulatif:</h3>
                <p><strong>Nombre d'articles:</strong> {totalItems}</p>
                <p><strong>Montant total:</strong> TND{totalAmount}</p>
                <p><strong>Frais de livraison Inclus Déjà:</strong> TND 8</p>
                <p><strong>Adresse de livraison:</strong> {shippingAddress}</p>
                <p><strong>Téléphone:</strong> {phoneNumber}</p>
              </div>
              
              <div className="modal-actions2">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="cancel-btn2"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSubmitOrder}
                  className="submit-order-btn2"
                  disabled={loading}
                >
                  {loading ? 'Traitement...' : 'Confirmer la commande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;