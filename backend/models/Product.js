const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: {
    type: String,
    trim: true
  },
  photos: [{
    type: String
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  careTips: {
    watering: String,
    light: String,
    temperature: String,
    soil: String
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  category: {
  type: String,
  enum: ["succulente", "interieur", "fleur", "exterieur", "aromatique", "graine","papier"],
  required: true
}
});

// Index pour la recherche
productSchema.index({ name: 'text', scientificName: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);