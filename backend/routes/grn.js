const express = require('express');
const router = express.Router();
const { getGRNs, createGRN } = require('../controllers/grnController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Inventory'), getGRNs)
  .post(authorize('Admin', 'Inventory'), createGRN);

module.exports = router;
