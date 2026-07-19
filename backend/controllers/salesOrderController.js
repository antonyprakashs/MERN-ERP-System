const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');

// @desc    Get all sales orders
// @route   GET /api/sales-orders
// @access  Private
const getSalesOrders = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const filter = {};
    if (searchQuery) {
      const Customer = require('../models/Customer');
      const matchedCustomers = await Customer.find({
        name: { $regex: searchQuery, $options: 'i' }
      });
      const customerIds = matchedCustomers.map(c => c._id);

      filter.$or = [
        { customer: { $in: customerIds } },
        { status: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (req.query.pagination === 'false') {
      const orders = await SalesOrder.find(filter)
        .populate('customer', 'name contact address')
        .populate('products.product', 'title SKU price')
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

    const orders = await SalesOrder.find(filter)
      .populate('customer', 'name contact address')
      .populate('products.product', 'title SKU price')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await SalesOrder.countDocuments(filter);

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

// @desc    Get sales order by ID
// @route   GET /api/sales-orders/:id
// @access  Private
const getSalesOrderById = async (req, res) => {
  try {
    const order = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name contact address')
      .populate('products.product', 'title SKU price');
    
    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new sales order
// @route   POST /api/sales-orders
// @access  Private
const createSalesOrder = async (req, res) => {
  try {
    const { customer, products, status } = req.body;

    if (!customer || !products || !products.length) {
      return res.status(400).json({ message: 'Please provide customer and at least one product' });
    }

    let calculatedTotalPrice = 0;
    const orderProducts = [];

    // Validate products exist and check stock if completing
    for (const item of products) {
      const productObj = await Product.findById(item.product);
      if (!productObj) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }

      if (status === 'Completed' && productObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product '${productObj.title}'. Available: ${productObj.stock}, Requested: ${item.quantity}`
        });
      }

      calculatedTotalPrice += productObj.price * item.quantity;
      orderProducts.push({
        product: item.product,
        quantity: item.quantity
      });
    }

    // Create the order
    const orderStatus = status || 'Pending';
    const order = await SalesOrder.create({
      customer,
      products: orderProducts,
      status: orderStatus,
      totalPrice: calculatedTotalPrice
    });

    // If order is completed on creation, deduct inventory stock
    if (orderStatus === 'Completed') {
      for (const item of orderProducts) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    const populatedOrder = await SalesOrder.findById(order._id)
      .populate('customer', 'name contact address')
      .populate('products.product', 'title SKU price');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sales order status or details
// @route   PUT /api/sales-orders/:id
// @access  Private
const updateSalesOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await SalesOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    // Check if order is already completed
    if (order.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot modify a completed sales order' });
    }

    // If transitioning from Pending to Completed, check stock and deduct
    if (status === 'Completed' && order.status !== 'Completed') {
      // Validate all stock levels first
      for (const item of order.products) {
        const productObj = await Product.findById(item.product);
        if (!productObj) {
          return res.status(404).json({ message: `Product referenced in order not found` });
        }
        if (productObj.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock to complete order. Product '${productObj.title}' has stock of ${productObj.stock}, order requires ${item.quantity}`
          });
        }
      }

      // Deduct stock
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    order.status = status || order.status;
    const updatedOrder = await order.save();

    const populatedOrder = await SalesOrder.findById(updatedOrder._id)
      .populate('customer', 'name contact address')
      .populate('products.product', 'title SKU price');

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder
};
