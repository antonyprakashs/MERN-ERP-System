const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({})
      .populate({
        path: 'salesOrder',
        populate: [
          { path: 'customer', select: 'name contact address' },
          { path: 'products.product', select: 'title SKU price' }
        ]
      });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new invoice from sales order
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const { salesOrder: salesOrderId } = req.body;

    if (!salesOrderId) {
      return res.status(400).json({ message: 'Sales order ID is required' });
    }

    // Find the Sales Order
    const salesOrder = await SalesOrder.findById(salesOrderId);
    if (!salesOrder) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    // Check if invoice already exists for this sales order
    const invoiceExists = await Invoice.findOne({ salesOrder: salesOrderId });
    if (invoiceExists) {
      return res.status(400).json({ message: 'An invoice has already been generated for this sales order' });
    }

    // Create Invoice
    const invoice = await Invoice.create({
      salesOrder: salesOrderId,
      amount: salesOrder.totalPrice,
      status: 'Unpaid'
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: 'salesOrder',
        populate: [
          { path: 'customer', select: 'name contact address' },
          { path: 'products.product', select: 'title SKU price' }
        ]
      });

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice status (e.g. Paid, Unpaid)
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status || invoice.status;
    const updatedInvoice = await invoice.save();

    const populatedInvoice = await Invoice.findById(updatedInvoice._id)
      .populate({
        path: 'salesOrder',
        populate: [
          { path: 'customer', select: 'name contact address' },
          { path: 'products.product', select: 'title SKU price' }
        ]
      });

    res.json(populatedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'salesOrder',
        populate: [
          { path: 'customer', select: 'name contact address' },
          { path: 'products.product', select: 'title SKU price' }
        ]
      });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice
};
