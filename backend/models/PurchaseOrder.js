const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Purchase order must belong to a supplier']
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product reference is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1']
        }
      }
    ],
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Received'],
        message: '{VALUE} is not a valid purchase order status'
      },
      default: 'Pending',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
