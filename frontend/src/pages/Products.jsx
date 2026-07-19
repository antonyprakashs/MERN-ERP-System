import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  X,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    SKU: '',
    price: '',
    stock: '',
    reorderLevel: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products?page=${page}&search=${searchTerm}`);
      setProducts(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      SKU: '',
      price: '',
      stock: '0',
      reorderLevel: '10'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      SKU: product.SKU,
      price: product.price.toString(),
      stock: product.stock.toString(),
      reorderLevel: product.reorderLevel.toString()
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, SKU, price, stock, reorderLevel } = formData;

    if (!title || !SKU || price === '') {
      return toast.error('Please enter all required fields');
    }

    try {
      const payload = {
        title,
        SKU: SKU.trim().toUpperCase(),
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        reorderLevel: parseInt(reorderLevel) || 10
      };

      if (editingProduct) {
        // Edit flow
        const { data } = await API.put(`/products/${editingProduct._id}`, payload);
        toast.success(`Product '${data.title}' updated successfully`);
      } else {
        // Create flow
        const { data } = await API.post('/products', payload);
        toast.success(`Product '${data.title}' created successfully`);
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      toast.error(msg);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product removed successfully');
      fetchProducts();
    } catch (error) {
      const msg = error.response?.data?.message || 'Delete failed';
      toast.error(msg);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Product Catalog</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track company inventory parts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/20 hover:shadow-primary-500/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
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
            placeholder="Search by title or SKU..."
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

      {/* Products Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No products found matching the search.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-6">Product details</th>
                    <th className="py-3.5 px-6">SKU</th>
                    <th className="py-3.5 px-6">Unit Price</th>
                    <th className="py-3.5 px-6">Stock Status</th>
                    <th className="py-3.5 px-6">Reorder Level</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {products.map((product) => {
                    const isLowStock = product.stock <= product.reorderLevel;
                    return (
                      <tr key={product._id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-900/60 rounded-lg text-primary-400">
                              <Package className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-white text-base">{product.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-300">{product.SKU}</td>
                        <td className="py-4 px-6 text-white font-medium">${product.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold text-sm ${isLowStock ? 'text-red-400' : 'text-emerald-400'}`}>
                              {product.stock} units
                            </span>
                            {isLowStock && (
                              <span className="flex items-center bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{product.reorderLevel} units</td>
                        <td className="py-4 px-6 text-right space-x-3">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="text-gray-400 hover:text-primary-400 p-1.5 hover:bg-gray-850 rounded transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.title)}
                            className="text-gray-400 hover:text-red-400 p-1.5 hover:bg-gray-850 rounded transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-primary-400" />
                {editingProduct ? 'Edit Product Attributes' : 'Register New Product'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Steel Bolts 10mm"
                    className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    name="SKU"
                    value={formData.SKU}
                    onChange={handleInputChange}
                    placeholder="e.g. BOLT-ST-10MM"
                    className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Unit Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Current Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Reorder Threshold Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-gray-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-850 hover:text-white rounded-lg text-sm text-gray-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/25 transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
