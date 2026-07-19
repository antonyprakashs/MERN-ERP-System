const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const filter = {};
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { SKU: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (req.query.pagination === 'false') {
      const products = await Product.find(filter).sort({ createdAt: -1 });
      return res.json({
        data: products,
        page: 1,
        pages: 1,
        total: products.length
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      data: products,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin or Inventory role recommended)
const createProduct = async (req, res) => {
  try {
    const { title, SKU, price, stock, reorderLevel } = req.body;

    if (!title || !SKU || price === undefined) {
      return res.status(400).json({ message: 'Please add title, SKU, and price' });
    }

    const skuExists = await Product.findOne({ SKU: SKU.toUpperCase() });
    if (skuExists) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = await Product.create({
      title,
      SKU: SKU.toUpperCase(),
      price,
      stock: stock || 0,
      reorderLevel: reorderLevel || 10
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { title, SKU, price, stock, reorderLevel } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If updating SKU, check if duplicate exists
    if (SKU && SKU.toUpperCase() !== product.SKU) {
      const skuExists = await Product.findOne({ SKU: SKU.toUpperCase() });
      if (skuExists) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
      product.SKU = SKU.toUpperCase();
    }

    product.title = title || product.title;
    product.price = price !== undefined ? price : product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
