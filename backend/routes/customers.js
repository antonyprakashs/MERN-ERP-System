const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Apply protection to all customer routes
router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(validate('customerSupplier'), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(validate('customerSupplier'), updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
