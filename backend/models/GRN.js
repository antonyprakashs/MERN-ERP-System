const mongoose = require('mongoose');

const grnSchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
      required: [true, 'GRN must be linked to a purchase order'],
      unique: true // A Purchase Order can only have one GRN once received
    },
    dateReceived: {
      type: Date,
      default: Date.now,
      required: true
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'GRN must be checked by a user']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('GRN', grnSchema);
