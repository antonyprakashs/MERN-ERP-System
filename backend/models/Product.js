const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      trim: true
    },
    SKU: {
      type: String,
      required: [true, 'Please provide a product SKU'],
      unique: true,
      trim: true,
      uppercase: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Please provide a product reorder level'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
