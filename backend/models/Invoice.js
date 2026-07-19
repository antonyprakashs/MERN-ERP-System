const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    salesOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      required: [true, 'Invoice must be linked to a sales order']
    },
    dateGenerated: {
      type: Date,
      default: Date.now,
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Invoice amount is required'],
      min: [0, 'Invoice amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['Unpaid', 'Paid'],
        message: '{VALUE} is not a valid invoice status'
      },
      default: 'Unpaid',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
