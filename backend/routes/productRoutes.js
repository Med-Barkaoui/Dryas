// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET tous les produits avec filtres
router.get('/products', async (req, res) => {
  try {
    const { search, category, maxPrice, tags } = req.query;
    
    // Construire la requête
    let query = {};
    
    // Filtre par recherche
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtre par catégorie
    if (category) {
      const categories = category.split(',');
      query.category = { $in: categories };
    }
    
    // Filtre par tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Filtre par prix maximum
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }
    
    // Exécuter la requête
    const products = await Product.find(query);
    
    // Récupérer toutes les catégories uniques
    const categories = await Product.distinct('category');
    
    // Récupérer tous les tags uniques
    const allTags = await Product.distinct('tags');
    
    // Formater les produits pour le frontend
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      scientificName: product.scientificName || '',
      price: product.price,
      images: product.photos || [], // Toujours utiliser 'images'
      photos: product.photos || [], // Doublon pour compatibilité
      description: product.description,
      stock: product.stock,
      category: product.category,
      tags: product.tags || [],
      isBestseller: product.isBestseller || false,
      isFeatured: product.isFeatured || false,
      careTips: product.careInstructions || {
        watering: '',
        light: '',
        temperature: '',
        soil: ''
      }
    }));
    
    res.json({
      success: true,
      products: formattedProducts,
      filters: {
        categories: categories.filter(c => c), // enlever les valeurs null
        tags: allTags.filter(tag => tag) // enlever les valeurs null
      },
      total: products.length
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits',
      error: error.message
    });
  }
});







// @route   GET /api/products/:id
// @desc    Récupérer un produit spécifique par ID
// @access  Public
router.get('/products/:id', async (req, res) => {
  try {
    // Vérifier si l'ID est valide
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID de produit invalide'
      });
    }

    console.log('Recherche du produit avec ID:', req.params.id);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    // Formater la réponse
    const responseProduct = {
      _id: product._id,
      name: product.name,
      scientificName: product.scientificName,
      description: product.description ,
      price: product.price,
      photos: product.photos ,
      stock: product.stock,
      category: product.category,
      careTips: product.careTips
    };
    
    console.log('Produit trouvé:', responseProduct);
    
    res.json({
      success: true,
      product: responseProduct
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    
    // Si l'ID n'est pas un ObjectId valide
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Format d\'ID invalide'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }


  
});

module.exports = router;