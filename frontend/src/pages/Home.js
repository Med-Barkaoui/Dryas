// Home.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Filter, X, ArrowLeft } from "lucide-react"; // Ajoutez ces icônes

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(100);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // NOUVEL ÉTAT : Contrôle l'affichage du filtre
  const [showFilter, setShowFilter] = useState(false);
  
  // Référence pour le timeout
  const searchTimeoutRef = useRef(null);
  const priceTimeoutRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://dryas.onrender.com';

  // Fonction pour obtenir l'image d'un produit
  const getProductImage = (product) => {
    const possibleImageFields = [
      'image', 'imageUrl', 'img', 'photo', 'picture',
      'images', 'photos', 'pictures'
    ];
    
    for (const field of possibleImageFields) {
      if (product[field]) {
        if (Array.isArray(product[field]) && product[field].length > 0) {
          const img = product[field][0];
          if (img && (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:'))) {
            return img;
          }
        }
        else if (typeof product[field] === 'string' && product[field].trim() !== '') {
          const img = product[field].trim();
          if (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')) {
            return img;
          }
        }
      }
    }
    
    return null;
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      
      if (selectedCategories.length > 0) {
        params.append('category', selectedCategories.join(','));
      }
      
      if (priceRange < 100) {
        params.append('maxPrice', priceRange);
      }
      
      if (searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      
      const response = await axios.get(`${API_URL}/api/products?${params.toString()}`);
      
      if (response.data.success) {
        const productsData = response.data.products || [];
        setProducts(productsData);
        
        if (response.data.filters?.categories && response.data.filters.categories.length > 0) {
          setCategories(response.data.filters.categories);
        } else {
          const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
          if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories);
          } else {
            setCategories([
              'Indoor Plants',
              'Succulents', 
              'Cacti',
              'Trees',
              'Herbs',
              'Flowering'
            ]);
          }
        }
        
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, priceRange, searchTerm, API_URL]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories]); // Seulement pour les catégories

  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts();
    }, 500); // Délai de 500ms après la dernière frappe
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Effet pour le prix avec debounce
  useEffect(() => {
    if (priceTimeoutRef.current) {
      clearTimeout(priceTimeoutRef.current);
    }
    
    priceTimeoutRef.current = setTimeout(() => {
      fetchProducts();
    }, 300); // Délai de 300ms après le dernier changement
    
    return () => {
      if (priceTimeoutRef.current) {
        clearTimeout(priceTimeoutRef.current);
      }
    };
  }, [priceRange]);

  const handleSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    fetchProducts();
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange(100);
    setSearchTerm('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (priceTimeoutRef.current) {
      clearTimeout(priceTimeoutRef.current);
    }
    fetchProducts();
  };

  const getCategoryCount = (category) => {
    return products.filter(p => p.category === category).length;
  };

  // Fonction pour naviguer vers la page produit
  const handleProductSelect = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="dryas-container">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dryas-container">
      <Navbar />
      <hr />

      {/* Bouton de filtre en bas à gauche (toujours visible) */}
      {!showFilter && (
        <button 
          className="filter-toggle-btn bottom-left"
          onClick={() => setShowFilter(true)}
        >
          <Filter size={24} />
        </button>
      )}

      <div className="dryas-main">
        {/* Filtre - Conditionnellement affiché */}
        {showFilter ? (
          <aside className="dryas-sidebar">
            {/* Bouton pour fermer le filtre (flèche en haut à gauche) */}
            <button 
              className="filter-close-btn top-left"
              onClick={() => setShowFilter(false)}
            >
              <ArrowLeft size={24} />
            </button>

            <div className="sidebar-section">
              <h2 className="sidebar-title">Catégories</h2>
              <ul className="categories-list">
                {categories.map((category, index) => (
                  <li key={index} className="category-item">
                    <label className="category-label">
                      <input
                        type="checkbox"
                        className="category-checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <span className="category-text">
                        <span className="category-name">{category}</span>
                        <span className="category-count">({getCategoryCount(category)})</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-section">
              <h2 className="sidebar-title">Fourchette de prix</h2>
              <div className="price-range-container">
                <div className="price-labels">
                  <span className="price-min">TND0</span>
                  <span className="price-max">TND{priceRange}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="price-slider"
                />
              </div>
            </div>

            <button onClick={resetFilters} className="reset-btn">
              Réinitialiser les filtres
            </button>
          </aside>
        ) : null}

        <main className={`dryas-content ${!showFilter ? 'full-width' : ''}`}>
          <div className="content-header">
            <h1>Catalogue des Plantes</h1>
            <p>Découvrez notre collection complète de plantes</p>
            <div className="main-search-container">
              <input
                type="text"
                className="search-bar-main"
                placeholder="Chercher une plante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {error && (
            <div className="error-alert">
              <p>{error}</p>
            </div>
          )}

          {loading && products.length > 0 && (
            <div className="loading-indicator">
              <div className="small-spinner"></div>
              <p>Mise à jour des résultats...</p>
            </div>
          )}

          <div className="products-grid">
            {products.map((product) => {
              const productImage = getProductImage(product);
              
              return (
                <div 
                  key={product._id || product.id || Math.random()} 
                  className="product-card"
                  onClick={() => handleProductSelect(product._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-badges">
                    {product.stock < 10 && product.stock > 0 && (
                      <span className="badge low-stock">Peu de stock</span>
                    )}
                  </div>

                  <div className="card-image">
                    <img
                      src={productImage || 'https://via.placeholder.com/300x200?text=Plante'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Non+Disponible';
                      }}
                    />
                  </div>

                  <div className="card-content">
                    <h3>{product.name}</h3>
                    {product.scientificName && (
                      <p className="scientific">{product.scientificName}</p>
                    )}
                    
                    <p className="description">
                      {product.description && product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description || 'aucune description'}
                    </p>

                    <div className="product-tags">
                      {product.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="card-footer">
                      <div className="price">TND{product.price?.toFixed(2) || '0.00'}</div>
                      <div className={`stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.stock > 0 ? 'En Stock' : 'Rupture de Stock'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && !loading && !error && (
            <div className="no-results">
              <p>Aucun produit trouvé.</p>
              <button onClick={resetFilters}>Voir tous les produits</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;