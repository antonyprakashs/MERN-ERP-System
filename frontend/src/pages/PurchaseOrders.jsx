import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { 
  ClipboardList, 
  Plus, 
  X,
  PlusCircle,
  Trash2,
  PackageCheck,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderLines, setOrderLines] = useState([]); // [{ product: {}, quantity: 1 }]
  
  // Current item being added to line
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        API.get(`/purchase-orders?page=${page}&search=${searchTerm}`),
        API.get('/suppliers?pagination=false'),
        API.get('/products?pagination=false')
      ]);
      setPurchaseOrders(ordersRes.data.data || []);
      setTotalPages(ordersRes.data.pages || 1);
      setSuppliers(suppliersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load purchase order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [page]);

  const handleOpenModal = () => {
    setSelectedSupplierId('');
    setOrderLines([]);
    setCurrentProductId('');
    setCurrentQuantity(1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Add line item to draft
  const handleAddLineItem = () => {
    if (!currentProductId) {
      return toast.error('Please select a product first');
    }

    const qty = parseInt(currentQuantity);
    if (!qty || qty <= 0) {
      return toast.error('Quantity must be at least 1');
    }

    // Find the product details
    const product = products.find(p => p._id === currentProductId);
    if (!product) return;

    // Check if product already added
    const existingIndex = orderLines.findIndex(line => line.product._id === currentProductId);
    if (existingIndex > -1) {
      const updatedLines = [...orderLines];
      updatedLines[existingIndex].quantity += qty;
      setOrderLines(updatedLines);
    } else {
      setOrderLines([...orderLines, { product, quantity: qty }]);
    }

    // Reset inputs
    setCurrentProductId('');
    setCurrentQuantity(1);
  };

  // Remove line item from draft
  const handleRemoveLineItem = (index) => {
    const updatedLines = orderLines.filter((_, idx) => idx !== index);
    setOrderLines(updatedLines);
  };

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      return toast.error('Please select a supplier');
    }

    if (orderLines.length === 0) {
      return toast.error('Please add at least one product to the purchase order');
    }

    try {
      const payload = {
        supplier: selectedSupplierId,
        products: orderLines.map(line => ({
          product: line.product._id,
          quantity: line.quantity
        }))
      };

      await API.post('/purchase-orders', payload);
      toast.success('Purchase order issued successfully!');
      fetchInitialData();
      handleCloseModal();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create purchase order';
      toast.error(msg);
    }
  };

  // Trigger Goods Receipt Note (GRN)
  const handleReceiveOrder = async (orderId) => {
    if (!window.confirm('Do you want to generate a Goods Receipt Note (GRN) and update inventory stock for these items?')) return;
    try {
      const { data } = await API.post('/grn', { purchaseOrder: orderId });
      toast.success(`GRN generated successfully! Stock increased by ${data.purchaseOrder.products.reduce((acc, p) => acc + p.quantity, 0)} units.`);
      fetchInitialData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to receive goods';
      toast.error(msg);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInitialData();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Purchase Orders</h1>
          <p className="text-gray-400 text-sm mt-1">Issue and track procurement orders to replenish inventory stock</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/20 hover:shadow-primary-500/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Table Filters */}
      <form onSubmit={handleSearchSubmit} className="flex bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-md gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by supplier name or order status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 rounded-lg py-2 pl-9 pr-4 text-white text-sm outline-none transition-all placeholder-gray-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-750 text-white font-semibold rounded-lg text-sm transition-all cursor-pointer"
        >
          Query
        </button>
      </form>

      {/* Orders Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading orders...</p>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No purchase orders issued yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-6">PO Number</th>
                    <th className="py-3.5 px-6">Supplier</th>
                    <th className="py-3.5 px-6">Items & Quantities</th>
                    <th className="py-3.5 px-6">Current Status</th>
                    <th className="py-3.5 px-6 text-right font-semibold">Inventory Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {purchaseOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-white">#PO-{order._id.substring(18)}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{order.supplier?.name || 'Deleted Supplier'}</div>
                        <div className="text-[11px] text-gray-500">{order.supplier?.contact || 'No contact'}</div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-1 text-xs">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="text-gray-300">
                              {item.product?.title || 'Unknown Product'} <span className="text-gray-500">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                          order.status === 'Received'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {order.status === 'Pending' ? (
                          <button
                            onClick={() => handleReceiveOrder(order._id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5 mr-0.5" />
                            <span>Receive Goods (GRN)</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">Stock Updated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4 bg-gray-950/30">
                <p className="text-xs text-gray-500">
                  Page <span className="font-semibold text-white">{page}</span> of{' '}
                  <span className="font-semibold text-white">{totalPages}</span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="p-1.5 bg-[#090d16] border border-gray-800 text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-1.5 bg-[#090d16] border border-gray-800 text-gray-400 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-2xl animate-scaleUp max-h-[90svh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-primary-400" />
                Draft New Purchase Order
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Supplier Account *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2.5 px-3 text-white text-sm outline-none transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Add Product Line Section */}
              <div className="bg-[#090d16]/75 border border-gray-800 rounded-lg p-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add Order Line Item</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Product Name
                    </label>
                    <select
                      value={currentProductId}
                      onChange={(e) => setCurrentProductId(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-800 focus:border-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.title} (SKU: {p.SKU}) - [Stock: {p.stock}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Procurement Qty
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(e.target.value)}
                        className="w-full bg-[#111827] border border-gray-800 focus:border-primary-500 rounded-lg py-1.5 px-3 text-white text-sm outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-primary-600/15 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Lines List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Replenishment List</h4>
                {orderLines.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-gray-800 rounded-lg text-gray-600 text-xs">
                    No products added yet. Use the selector above.
                  </div>
                ) : (
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs text-gray-400">
                      <thead className="bg-gray-900/60 uppercase text-gray-400 border-b border-gray-800">
                        <tr>
                          <th className="py-2.5 px-4">Product Name</th>
                          <th className="py-2.5 px-4">SKU</th>
                          <th className="py-2.5 px-4 text-center">Procurement Qty</th>
                          <th className="py-2.5 px-4 text-center">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {orderLines.map((line, index) => (
                          <tr key={index} className="hover:bg-gray-800/20">
                            <td className="py-2.5 px-4 font-semibold text-white">{line.product.title}</td>
                            <td className="py-2.5 px-4 font-mono text-[11px] text-gray-300">{line.product.SKU}</td>
                            <td className="py-2.5 px-4 text-center text-white font-semibold">{line.quantity}</td>
                            <td className="py-2.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(index)}
                                className="text-gray-500 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 border-t border-gray-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-850 rounded-lg text-sm text-gray-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/25 transition-colors cursor-pointer"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
