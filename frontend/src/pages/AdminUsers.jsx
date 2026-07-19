import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  X, 
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/users?page=${page}&search=${searchTerm}`);
      // The API will return paginated data: { data, page, pages, total }
      setUsers(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Sales'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Empty, only set if changing
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    if (!name || !email || (!editingUser && !password)) {
      return toast.error('Please enter all required fields');
    }

    try {
      if (editingUser) {
        // Update user (endpoint PUT /api/users/:id)
        const payload = { name, email, role };
        if (password) payload.password = password;
        
        await API.put(`/users/${editingUser._id}`, payload);
        toast.success(`User '${name}' updated successfully`);
      } else {
        // Register user (endpoint POST /api/auth/register)
        await API.post('/auth/register', { name, email, password, role });
        toast.success(`User '${name}' registered successfully`);
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed';
      toast.error(msg);
    }
  };

  const handleDelete = async (id, name) => {
    if (id === currentUser._id) {
      return toast.warning('Security Lockout: You cannot delete your own account.');
    }
    if (!window.confirm(`Are you sure you want to delete user '${name}'? This cannot be undone.`)) return;

    try {
      await API.delete(`/users/${id}`);
      toast.success('User profile removed successfully');
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Delete failed';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display">User & Access Management</h1>
          <p className="text-gray-400 text-sm mt-1">Control system operators, role definitions, and system permissions</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/20 hover:shadow-primary-500/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex bg-[#111827] border border-gray-800 rounded-xl p-4 shadow-md gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
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

      {/* Users Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Accessing directory logs...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No system users found.
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Assigned Role</th>
                    <th className="py-3.5 px-6">Registered On</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {users.map((item) => {
                    const isSelf = item._id === currentUser._id;
                    return (
                      <tr key={item._id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-900/60 rounded-lg text-primary-400">
                              <UserCheck className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-white text-base">
                              {item.name} {isSelf && <span className="text-xs text-primary-500 font-bold bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full ml-2">YOU</span>}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-gray-300">{item.email}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                            item.role === 'Admin' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : item.role === 'Inventory'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-300">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right space-x-3">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="text-gray-400 hover:text-primary-400 p-1.5 hover:bg-gray-850 rounded transition-all cursor-pointer"
                            title="Edit Role/Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.name)}
                            disabled={isSelf}
                            className={`text-gray-400 hover:text-red-400 p-1.5 hover:bg-gray-850 rounded transition-all cursor-pointer ${isSelf ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title={isSelf ? 'Cannot delete self' : 'Delete User'}
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
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2 text-primary-400" />
                {editingUser ? `Configure Profile: ${editingUser.name}` : 'Register New ERP Operator'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Password {editingUser && <span className="text-gray-600 font-normal">(Leave blank to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingUser ? '••••••••' : 'Password (min 6 characters)'}
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all"
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System Permission Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-[#090d16] border border-gray-800 focus:border-primary-500 rounded-lg py-2 px-3 text-white text-sm outline-none transition-all"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Sales">Sales (Orders & Billing)</option>
                  <option value="Inventory">Inventory (Products, POs & Shipping)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg text-sm transition-all cursor-pointer border border-gray-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg text-sm shadow-md transition-all cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
