import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: ''
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/customers?page=${page}&search=${searchTerm}`);
      setCustomers(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      contact: '',
      address: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      contact: customer.contact || '',
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, contact, address } = formData;

    if (!name) {
      return toast.error('Customer name is required');
    }

    try {
      if (editingCustomer) {
        // Edit flow
        const { data } = await API.put(`/customers/${editingCustomer._id}`, { name, contact, address });
        toast.success(`Customer '${data.name}' updated successfully`);
      } else {
        // Create flow
        const { data } = await API.post('/customers', { name, contact, address });
        toast.success(`Customer '${data.name}' registered successfully`);
      }
      fetchCustomers();
      handleCloseModal();
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      toast.error(msg);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer '${name}'?`)) return;
    try {
      await API.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Delete failed';
      toast.error(msg);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">Customer Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Manage corporate client profiles and accounts</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/20 hover:shadow-primary-500/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
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
            placeholder="Search by name or contact info..."
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

      {/* Customers Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No customers found matching the search.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-6">Customer details</th>
                    <th className="py-3.5 px-6">Contact / Phone</th>
                    <th className="py-3.5 px-6">Delivery Address</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-900/60 rounded-lg text-emerald-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-white text-base">{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-medium">{customer.contact || 'N/A'}</td>
                      <td className="py-4 px-6 text-gray-300 max-w-xs truncate">{customer.address || 'N/A'}</td>
                      <td className="py-4 px-6 text-right space-x-3">
                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          className="text-gray-400 hover:text-primary-400 p-1.5 hover:bg-gray-850 rounded transition-all cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id, customer.name)}
                          className="text-gray-400 hover:text-red-400 p-1.5 hover:bg-gray-850 rounded transition-all cursor-pointer"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-primary-400" />
                {editingCustomer ? 'Modify Customer Record' : 'Register Customer'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-880 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Corporation"
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Contact / Phone Number
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="e.g. +1 (555) 123-4567"
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Corporate Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 100 Main St, Suite 400, Boston, MA 02110"
                  rows="3"
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all placeholder-gray-600 resize-none"
                />
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
                  {editingCustomer ? 'Save Changes' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
