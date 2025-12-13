import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';  // Import du Navbar séparé

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        
        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          setError(response.data.message || 'Produit non trouvé');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, API_URL]);

  const getProductImage = (product) => {
    if (product && product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product && product.photos && product.photos.length > 0) {
      return product.photos[0];
    }
    return 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop';
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Vérifier si la quantité demandée est disponible
    if (quantity > product.stock) {
      return;
    }
    
    const item = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: getProductImage(product),
      stock: product.stock
    };
    
    // Récupérer le panier existant
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Vérifier si le produit existe déjà dans le panier
    const existingItemIndex = cart.findIndex(item => item.productId === product._id);
    
    if (existingItemIndex > -1) {
      // Mettre à jour la quantité si le produit existe déjà
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      if (newQuantity <= product.stock) {
        cart[existingItemIndex].quantity = newQuantity;
      } else {
        return;
      }
    } else {
      // Ajouter le nouveau produit
      cart.push(item);
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Déclencher un événement pour mettre à jour le compteur
    window.dispatchEvent(new Event('cartUpdated'));
    
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (product) {
      alert(`Quantité maximale atteinte. Stock disponible: ${product.stock}`);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="error-container">
          <p>{error || 'Produit non trouvé'}</p>
          <button onClick={() => navigate('/home')} className="error-btn">
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
  <div className="product-detail-page">
    <Navbar />
    
    <div className="product-detail-container">
      <div className="product-detail-content">
        {/* Section principale en deux colonnes */}
        <div className="product-detail-main">
          {/* Colonne gauche: Image + 3 carreaux */}
          <div className="product-images">
            <div className="back-arrow-container">
              <button 
                onClick={() => navigate('/home')} 
                className="back-arrow-btn"
                title="Retour au catalogue"
              >
                ←
              </button>
            </div>
            
            <div className="main-image">
              <img 
                src={getProductImage(product)} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400?text=Image+Non+Disponible';
                }}
              />
            </div>
            
            {/* Trois carreaux sous l'image */}
            <div className="image-extra-info">
              <div className="image-info-item">
                <div className="image-info-icon">✓</div>
                <div className="image-info-text">Garantie 30 jours</div>
              </div>
              <div className="image-info-item">
                <div className="image-info-icon">📖</div>
                <div className="image-info-text">Instructions d'entretien</div>
              </div>
              <div className="image-info-item">
                <div className="image-info-icon">📦</div>
                <div className="image-info-text">Frais de livraison: 8 TND</div>
              </div>
            </div>
          </div>

          {/* Colonne droite: Informations produit */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            {product.scientificName && (
              <p className="scientific-name">{product.scientificName}</p>
            )}
            
            <p className="product-description">
              {product.description || 'Description non disponible'}
            </p>

            {/* Tags */}
            <div className="product-tags">
              {product.tags?.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>

            {/* Prix du produit */}
            <div className="price-section">
              <div className="price-display">
                <span className="price-label">Prix: </span>
                <span className="product-price">TND{product.price?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="stock-status">
                <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? 'En Stock' : 'Rupture de Stock'}
                </span>
                {product.stock > 0 && (
                  <span className="stock-count">({product.stock} disponibles)</span>
                )}
              </div>
            </div>

            {/* Quantité et Ajouter au panier */}
            <div className="cart-section">
              <div className="quantity-selector">
                <h3>Quantité</h3>
                <div className="quantity-controls">
                  <button onClick={decrementQuantity} className="qty-btn">-</button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    onClick={incrementQuantity} 
                    className="qty-btn"
                    disabled={product && quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="add-to-cart-section">
                <button 
                  onClick={handleAddToCart} 
                  className="add-to-cart-btn"
                  disabled={product.stock <= 0}
                >
                  {product.stock > 0 ? (
                    `Ajouter au panier • TND${totalPrice}`
                  ) : (
                    'Produit indisponible'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions d'entretien (pleine largeur en bas) */}
        <div className="care-instructions-full">
          <h3>Instructions d'Entretien</h3>
          <div className="care-grid-full">
            <div className="care-item-full">
              <div className="care-icon-full">☀️</div>
              <div>
                <strong>Lumière</strong>
                <p>{product.careTips?.light || 'Information non disponible'}</p>
              </div>
            </div>
            <div className="care-item-full">
              <div className="care-icon-full">💧</div>
              <div>
                <strong>Arrosage</strong>
                <p>{product.careTips?.watering || 'Information non disponible'}</p>
              </div>
            </div>
            <div className="care-item-full">
              <div className="care-icon-full">🌡️</div>
              <div>
                <strong>Température</strong>
                <p>{product.careTips?.temperature || 'Information non disponible'}</p>
              </div>
            </div>
            <div className="care-item-full">
              <div className="care-icon-full">🌱</div>
              <div>
                <strong>Sol</strong>
                <p>{product.careTips?.soil || 'Information non disponible'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default ProductDetail;