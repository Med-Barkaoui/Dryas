const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    description: 'Plante tropicale avec des feuilles perforées uniques. Parfaite pour les intérieurs modernes.',
    price: 45.99,
    category: 'Indoor Plants',
    tags: ['Easy Care', 'Air Purifying', 'Statement Plant'],
    images: ['monstera.jpg'],
    stock: 15,
    isBestseller: true,
    isFeatured: true
  },
  {
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    description: 'Plante très résistante qui purifie l\'air. Idéale pour les débutants.',
    price: 32.50,
    category: 'Indoor Plants',
    tags: ['Low Maintenance', 'Air Purifying', 'Pet Safe'],
    images: ['snake-plant.jpg'],
    stock: 25,
    isBestseller: true,
    isFeatured: false
  },
  {
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    description: 'Arbre d\'intérieur élégant avec de grandes feuilles brillantes.',
    price: 89.99,
    category: 'Trees',
    tags: ['Statement Plant', 'Trending'],
    images: ['fiddle-leaf.jpg'],
    stock: 8,
    isBestseller: false,
    isFeatured: true
  },
  {
    name: 'Echeveria Succulent',
    scientificName: 'Echeveria elegans',
    description: 'Succulente en forme de rosette, facile à entretenir.',
    price: 12.99,
    category: 'Succulents',
    tags: ['Easy Care', 'Drought Tolerant'],
    images: ['echeveria.jpg'],
    stock: 40,
    isBestseller: true,
    isFeatured: false
  },
  {
    name: 'Golden Barrel Cactus',
    scientificName: 'Echinocactus grusonii',
    description: 'Cactus sphérique doré, nécessite peu d\'entretien.',
    price: 24.99,
    category: 'Cacti',
    tags: ['Low Maintenance', 'Drought Tolerant'],
    images: ['barrel-cactus.jpg'],
    stock: 18,
    isBestseller: false,
    isFeatured: true
  },
  {
    name: 'Basil Herb',
    scientificName: 'Ocimum basilicum',
    description: 'Herbe aromatique parfaite pour la cuisine italienne.',
    price: 8.99,
    category: 'Herbs',
    tags: ['Easy Care'],
    images: ['basil.jpg'],
    stock: 30,
    isBestseller: true,
    isFeatured: false
  },
  {
    name: 'Orchid',
    scientificName: 'Phalaenopsis',
    description: 'Orchidée élégante à floraison longue durée.',
    price: 34.99,
    category: 'Flowering',
    tags: ['Statement Plant', 'Trending'],
    images: ['orchid.jpg'],
    stock: 12,
    isBestseller: false,
    isFeatured: true
  },
  {
    name: 'Rubber Plant',
    scientificName: 'Ficus elastica',
    description: 'Plante aux feuilles larges et brillantes, purifie l\'air.',
    price: 39.99,
    category: 'Indoor Plants',
    tags: ['Easy Care', 'Air Purifying'],
    images: ['rubber-plant.jpg'],
    stock: 20,
    isBestseller: true,
    isFeatured: false
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dryas', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Supprimer les produits existants
    await Product.deleteMany({});
    console.log('Old products removed');

    // Insérer les nouveaux produits
    await Product.insertMany(sampleProducts);
    console.log('Sample products inserted');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();