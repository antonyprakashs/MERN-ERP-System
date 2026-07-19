const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder
} = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Apply protection to all purchase order routes
router.use(protect);

router.route('/')
  .get(getPurchaseOrders)
  .post(authorize('Admin', 'Inventory'), validate('order'), createPurchaseOrder);

router.route('/:id')
  .get(getPurchaseOrderById)
  .put(authorize('Admin', 'Inventory'), updatePurchaseOrder);

module.exports = router;
