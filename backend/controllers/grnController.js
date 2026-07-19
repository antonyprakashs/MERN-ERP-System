const GRN = require('../models/GRN');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

// @desc    Get all GRNs
// @route   GET /api/grn
// @access  Private
const getGRNs = async (req, res) => {
  try {
    const grns = await GRN.find({})
      .populate({
        path: 'purchaseOrder',
        populate: [
          { path: 'supplier', select: 'name contact address' },
          { path: 'products.product', select: 'title SKU price stock' }
        ]
      })
      .populate('checkedBy', 'name email role');
    res.json(grns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new GRN (Goods Receipt Note)
// @route   POST /api/grn
// @access  Private
const createGRN = async (req, res) => {
  try {
    const { purchaseOrder: purchaseOrderId } = req.body;

    if (!purchaseOrderId) {
      return res.status(400).json({ message: 'Purchase order ID is required' });
    }

    // 1. Find the Purchase Order
    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    // 2. Check if already received
    if (purchaseOrder.status === 'Received') {
      return res.status(400).json({ message: 'This purchase order has already been received' });
    }

    // Check if GRN already exists for this PO (safety check)
    const grnExists = await GRN.findOne({ purchaseOrder: purchaseOrderId });
    if (grnExists) {
      return res.status(400).json({ message: 'A GRN has already been generated for this purchase order' });
    }

    // 3. Update Product stock levels
    for (const item of purchaseOrder.products) {
      const productObj = await Product.findById(item.product);
      if (!productObj) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found. Stock update aborted.` });
      }
      
      // Increment stock
      productObj.stock += item.quantity;
      await productObj.save();
    }

    // 4. Update Purchase Order status to "Received"
    purchaseOrder.status = 'Received';
    await purchaseOrder.save();

    // 5. Create GRN record
    const grn = await GRN.create({
      purchaseOrder: purchaseOrderId,
      checkedBy: req.user._id
    });

    const populatedGRN = await GRN.findById(grn._id)
      .populate({
        path: 'purchaseOrder',
        populate: [
          { path: 'supplier', select: 'name contact address' },
          { path: 'products.product', select: 'title SKU price stock' }
        ]
      })
      .populate('checkedBy', 'name email role');

    res.status(201).json(populatedGRN);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGRNs,
  createGRN
};
