const express = require('express');
const router = express.Router();
const {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder
} = require('../controllers/salesOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Apply protection to all sales order routes
router.use(protect);

router.route('/')
  .get(getSalesOrders)
  .post(authorize('Admin', 'Sales'), validate('order'), createSalesOrder);

router.route('/:id')
  .get(getSalesOrderById)
  .put(authorize('Admin', 'Sales'), updateSalesOrder);

module.exports = router;
