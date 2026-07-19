const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Apply protection to all product routes
router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('Admin', 'Inventory'), validate('product'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('Admin', 'Inventory'), validate('product'), updateProduct)
  .delete(authorize('Admin', 'Inventory'), deleteProduct);

module.exports = router;
