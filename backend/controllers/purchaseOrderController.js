const PurchaseOrder = require('../models/PurchaseOrder');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const filter = {};
    if (searchQuery) {
      const Supplier = require('../models/Supplier');
      const matchedSuppliers = await Supplier.find({
        name: { $regex: searchQuery, $options: 'i' }
      });
      const supplierIds = matchedSuppliers.map(s => s._id);

      filter.$or = [
        { supplier: { $in: supplierIds } },
        { status: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (req.query.pagination === 'false') {
      const orders = await PurchaseOrder.find(filter)
        .populate('supplier', 'name contact address')
        .populate('products.product', 'title SKU price stock')
        .sort({ createdAt: -1 });
      return res.json({
        data: orders,
        page: 1,
        pages: 1,
        total: orders.length
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await PurchaseOrder.find(filter)
      .populate('supplier', 'name contact address')
      .populate('products.product', 'title SKU price stock')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PurchaseOrder.countDocuments(filter);

    res.json({
      data: orders,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name contact address')
      .populate('products.product', 'title SKU price stock');
    
    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new purchase order
// @route   POST /api/purchase-orders
// @access  Private
const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, products } = req.body;

    if (!supplier || !products || !products.length) {
      return res.status(400).json({ message: 'Please provide supplier and at least one product' });
    }

    const order = await PurchaseOrder.create({
      supplier,
      products,
      status: 'Pending'
    });

    const populatedOrder = await PurchaseOrder.findById(order._id)
      .populate('supplier', 'name contact address')
      .populate('products.product', 'title SKU price stock');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update purchase order status (Pending -> Received)
// @route   PUT /api/purchase-orders/:id
// @access  Private
const updatePurchaseOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (order.status === 'Received') {
      return res.status(400).json({ message: 'Cannot modify a received purchase order' });
    }

    order.status = status || order.status;
    const updatedOrder = await order.save();

    const populatedOrder = await PurchaseOrder.findById(updatedOrder._id)
      .populate('supplier', 'name contact address')
      .populate('products.product', 'title SKU price stock');

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder
};
