// backend/update-images.js
const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/dryas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Product = require('./models/Product');

async function updateImages() {
  try {
    console.log('Mise à jour des images des produits...');
    
    // Mettre à jour chaque produit avec des images Unsplash
    const updates = [
      {
        name: "Monstera Deliciosa",
        images: ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&auto=format&fit=crop"]
      },
      {
        name: "Aloe Vera",
        images: ["https://images.unsplash.com/photo-1523380677598-64d85b6c8c7d?w=400&auto=format&fit=crop"]
      },
      {
        name: "Pothos Doré",
        images: ["https://images.unsplash.com/photo-1598880940080-ff9a29891b85?w=400&auto=format&fit=crop"]
      },
      {
        name: "Ficus Lyrata",
        images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop"]
      },
      {
        name: "Graines de Tournesol",
        images: ["https://images.unsplash.com/photo-1598506267109-0d953cc63e1b?w=400&auto=format&fit=crop"]
      },
      {
        name: "Graines de Basilic",
        images: ["https://images.unsplash.com/photo-1599058945522-28d584b6f133?w=400&auto=format&fit=crop"]
      },
      {
        name: "Rosier Rouge",
        images: ["https://images.unsplash.com/photo-1574598192475-ea0bb2ea5d4b?w=400&auto=format&fit=crop"]
      },
      {
        name: "Orchidée Blanche",
        images: ["https://images.unsplash.com/photo-1558710841-f6c435ec5f05?w=400&auto=format&fit=crop"]
      }
    ];
    
    for (const update of updates) {
      const result = await Product.updateOne(
        { name: update.name },
        { $set: { images: update.images } }
      );
      console.log(`${update.name}: ${result.modifiedCount} modifié(s)`);
    }
    
    console.log('Mise à jour terminée!');
    process.exit(0);
    
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

updateImages();