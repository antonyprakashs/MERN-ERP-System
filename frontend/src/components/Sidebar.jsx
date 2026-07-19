import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck, 
  ClipboardList, 
  FileCheck, 
  Receipt,
  LogOut,
  Building2,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package, roles: ['Admin', 'Inventory'] },
    { path: '/customers', label: 'Customers', icon: Users, roles: ['Admin', 'Sales'] },
    { path: '/sales-orders', label: 'Sales Orders', icon: ShoppingCart, roles: ['Admin', 'Sales'] },
    { path: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['Admin', 'Inventory'] },
    { path: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList, roles: ['Admin', 'Inventory'] },
    { path: '/grn', label: 'GRNs (Receiving)', icon: FileCheck, roles: ['Admin', 'Inventory'] },
    { path: '/invoices', label: 'Invoices', icon: Receipt, roles: ['Admin', 'Sales'] },
    { path: '/admin', label: 'Users', icon: ShieldCheck, roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col justify-between h-screen sticky top-0">
      {/* Upper Logo / Branding */}
      <div>
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-display">Antigravity ERP</h1>
            <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Enterprise Suite</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-600/15 text-primary-400 border-l-4 border-primary-500 pl-3'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        {user && (
          <div className="mb-4 px-2 py-3 bg-gray-900/40 rounded-lg border border-gray-800/30">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white truncate">{user.name}</span>
              <span className="text-[11px] text-gray-500 truncate mb-1">{user.email}</span>
              <div className="flex mt-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  user.role === 'Admin' 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                    : user.role === 'Inventory'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-850 hover:bg-red-950/20 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-900/30 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
