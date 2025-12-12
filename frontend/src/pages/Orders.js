import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('dryas_token');
      
      if (!token) {
        setError('Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/orders/my-orders', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError('Erreur lors du chargement des commandes');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes:', err);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fonction pour générer un ID de commande
  const generateOrderId = (orderId, createdAt) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const shortId = orderId.slice(-4).toUpperCase();
    return `CMD-${year}${month}${day}-${shortId}`;
  };

  // Fonction pour obtenir la classe CSS selon le statut
  const getStatusClass = (status) => {
    switch(status) {
      case 'Livrée': return 'status-delivered';
      case 'Confirmée':
      case 'Expédiée': 
      case 'En cours': return 'status-processing';
      case 'Annulée': return 'status-cancelled';
      case 'En attente': return 'status-pending';
      default: return 'status-default';
    }
  };

  // Fonction pour obtenir l'icône selon le statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Livrée': return '✅';
      case 'Confirmée':
      case 'Expédiée':
      case 'En cours': return '🚚';
      case 'Annulée': return '❌';
      case 'En attente': return '⏳';
      default: return '📦';
    }
  };

  // Fonction pour traduire le statut
  const translateStatus = (status) => {
    const translations = {
      'En attente': 'En attente',
      'Confirmée': 'Confirmée',
      'Expédiée': 'Expédiée',
      'Livrée': 'Livrée',
      'Annulée': 'Annulée'
    };
    return translations[status] || status;
  };

  // Fonction pour re-commander
  const handleReorder = (order) => {
    const cartItems = order.products.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.price,
      quantity: item.quantity,
      image: item.product.images?.[0] || item.product.photos?.[0] || 'https://via.placeholder.com/80x80?text=Image'
    }));

    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cartUpdated'));
    alert('Les articles ont été ajoutés à votre panier !');
  };

  // Fonction pour voir les détails
  const handleViewDetails = (order) => {
    // Ici vous pouvez rediriger vers une page de détails de commande
    // ou afficher un modal avec plus d'informations
    console.log('Détails de la commande:', order);
    alert(`Détails de la commande ${order._id}\nStatut: ${order.status}\nDate: ${formatDate(order.createdAt)}`);
  };

  if (loading) {
    return (
      <div className="dryas-container">
        <Navbar />
        <hr />
        <div className="dryas-main">
          <div className="dryas-content-full">
            <div className="content-header">
              <h1>Mes Commandes</h1>
              <p>Chargement de vos commandes...</p>
            </div>
            <div className="loading-orders">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dryas-container">
        <Navbar />
        <hr />
        <div className="dryas-main">
          <div className="dryas-content-full">
            <div className="content-header">
              <h1>Mes Commandes</h1>
              <p>Consultez l'historique de vos commandes</p>
            </div>
            <div className="error-container">
              <p>{error}</p>
              <button onClick={fetchUserOrders} className="retry-btn">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dryas-container">
      <Navbar />
      <hr />
      
      <div className="dryas-main">
        <div className="dryas-content-full">
          <div className="content-header">
            <h1>Mes Commandes</h1>
            <p>Consultez l'historique de vos commandes</p>
          </div>

          <div className="orders-container">
            {/* Afficher les commandes ou le message "Aucune commande" */}
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>Commande #{generateOrderId(order._id, order.createdAt)}</h3>
                        <p className="order-date">Date: {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)} {translateStatus(order.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="order-items">
                      <h4>Articles commandés:</h4>
                      <ul className="items-list">
                        {order.products.map((item, index) => (
                          <li key={index} className="order-item">
                            <span className="item-name">
                              {item.product?.name || 'Produit non disponible'}
                            </span>
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-price">TND{item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="order-footer">
                      <div className="order-total">
                        <span>Total: </span>
                        <span className="total-amount">TND{order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="order-actions">
                        {order.status === 'Livrée' && (
                          <button 
                            className="action-btn reorder"
                            onClick={() => handleReorder(order)}
                          >
                            Commander à nouveau
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-orders">
                <div className="no-orders-icon">📦</div>
                <h2>Aucune commande</h2>
                <p>Vous n'avez pas encore passé de commande.</p>
                <NavLink to="/home" className="shop-btn">
                  Découvrir le catalogue
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;