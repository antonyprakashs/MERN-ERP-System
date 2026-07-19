const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Apply protection to all supplier routes
router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(validate('customerSupplier'), createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(validate('customerSupplier'), updateSupplier)
  .delete(deleteSupplier);

module.exports = router;
