// frontend/src/services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const productAPI = {
  // Récupérer tous les produits
  getProducts: (params) => API.get('/products', { params }),
  
  // Récupérer les statistiques des catégories
  getCategoryStats: () => API.get('/products/categories/stats'),
  
  // Récupérer un produit par ID
  getProductById: (id) => API.get(`/products/${id}`),
};

export default API;