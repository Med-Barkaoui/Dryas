import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Leaf } from "lucide-react";
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("dryas_token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/check-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmail(res.data.user.email);
      } catch (err) {
        console.error(err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // Charger le nombre d'articles dans le panier depuis localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    setCartItemCount(count);
    
    // Écouter les changements de panier
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const updatedCount = updatedCart.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(updatedCount);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("dryas_token");
    localStorage.removeItem("dryas_email");
    navigate("/");
  };

  const handleUserClick = () => {
    navigate('/profile');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <nav className="dryas-navbar">
        <div className="nav-left">
          <div className="logo-container">
            <Leaf size={28} className="logo-icon" />
            <span className="logo-text">Dryas</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="dryas-navbar">
      <div className="nav-left">
        <div className="logo-container">
          <Leaf size={31} className="logo-icon" />
          <span className="logo">Dryas</span>
        </div>
      </div>
      <div className="nav-center">
        <div className="nav-menu">
 
          <NavLink 
            to="/boutique" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Boutique
          </NavLink>
          <NavLink 
            to="/commandes" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Commandes
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Contact
          </NavLink>
        </div>
      </div>
      <div className="nav-right">
        {/* Affichage de l'email (optionnel) */}
        {email && (
          <div className="user-email-container">
            <span className="user-email">{email}</span>
          </div>
        )}
        
        <div className="nav-icons">
          <div 
            className="nav-icon cart-icon" 
            onClick={handleCartClick}
            title="Panier"
          >
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </div>
          
          <div 
            className="nav-icon logout-icon" 
            onClick={handleLogout}
            title="Déconnexion"
          >
            <LogOut size={24} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;