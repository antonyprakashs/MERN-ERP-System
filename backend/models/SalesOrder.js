const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Sales order must belong to a customer']
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
        values: ['Pending', 'Completed'],
        message: '{VALUE} is not a valid sales order status'
      },
      default: 'Pending',
      required: true
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
