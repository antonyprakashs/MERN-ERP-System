const express = require('express');
const router = express.Router();
const { getInvoices, getInvoiceById, createInvoice, updateInvoice } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Sales'), getInvoices)
  .post(authorize('Admin', 'Sales'), createInvoice);

router.route('/:id')
  .get(authorize('Admin', 'Sales'), getInvoiceById)
  .put(authorize('Admin', 'Sales'), updateInvoice);

module.exports = router;
