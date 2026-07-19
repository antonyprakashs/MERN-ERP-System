import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { 
  Package, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    recentOrders: [],
    chartData: [],
    stockData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Load data from APIs parallelly
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          API.get('/products?pagination=false'),
          API.get('/customers?pagination=false'),
          API.get('/sales-orders?pagination=false')
        ]);

        const products = productsRes.data.data || [];
        const customers = customersRes.data.data || [];
        const orders = ordersRes.data.data || [];

        // Calculate low stock
        const lowStock = products.filter(p => p.stock <= p.reorderLevel).length;

        // Calculate revenue from completed orders
        const revenue = orders
          .filter(o => o.status === 'Completed')
          .reduce((sum, o) => sum + o.totalPrice, 0);

        // Aggregate revenue data for the chart (grouped by date)
        const revenueByDate = {};
        orders.filter(o => o.status === 'Completed').forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          revenueByDate[date] = (revenueByDate[date] || 0) + order.totalPrice;
        });
        const chartData = Object.keys(revenueByDate).map(date => ({
          date,
          revenue: revenueByDate[date]
        })).slice(-7); // Last 7 active sales dates

        const stockData = products.map(p => ({
          name: p.title.length > 12 ? p.title.substring(0, 12) + "..." : p.title,
          stock: p.stock,
          reorder: p.reorderLevel
        })).slice(0, 5); // Top 5 products

        setMetrics({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalRevenue: revenue,
          lowStockCount: lowStock,
          recentOrders: sortedOrders,
          chartData,
          stockData
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (searchParams.get('unauthorized') === 'true') {
      toast.error('Access Denied: You do not have permissions for that resource.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: metrics.totalProducts,
      icon: Package,
      color: 'from-blue-600/20 to-blue-800/10 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Customers Directory',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'from-emerald-600/20 to-emerald-800/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Total Revenue',
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-600/20 to-purple-800/10 text-purple-400 border-purple-500/20'
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockCount,
      icon: AlertTriangle,
      color: metrics.lowStockCount > 0 
        ? 'from-red-600/20 to-red-800/10 text-red-400 border-red-500/20' 
        : 'from-gray-600/20 to-gray-800/10 text-gray-400 border-gray-500/20'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">System Overview</h1>
        <p className="text-gray-400 text-sm mt-1">High-level metrics and recent sales order activities</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`bg-gradient-to-br ${card.color} border p-6 rounded-xl flex items-center justify-between shadow-lg`}
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">{card.title}</span>
                <span className="text-3xl font-bold text-white block">{card.value}</span>
              </div>
              <div className="p-3 bg-gray-900/60 rounded-lg">
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Revenue Trend Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary-400" />
            Revenue Trend (Completed Sales)
          </h3>
          <div className="h-80 w-full">
            {metrics.chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No revenue data available for charts.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '8px' }} 
                    itemStyle={{ color: '#609eff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Product Stock Level Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-emerald-400" />
            Inventory Levels vs. Reorder Level
          </h3>
          <div className="h-80 w-full">
            {metrics.stockData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No products in inventory to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.stockData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="stock" fill="#10b981" name="Current Stock" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reorder" fill="#ef4444" name="Reorder Alert" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Action Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-primary-400" />
              Recent Sales Orders
            </h3>
            <Link to="/sales-orders" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center transition-colors">
              View All Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {metrics.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No sales orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {metrics.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-white">#{order._id.substring(18)}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-300">{order.customer?.name || 'Deleted Customer'}</td>
                      <td className="py-3.5 px-4 text-white font-semibold">${order.totalPrice.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations Links */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-400" />
            Quick Actions
          </h3>
          
          <div className="flex flex-col space-y-3">
            <Link 
              to="/products" 
              className="p-3 bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-lg flex items-center justify-between text-sm transition-all"
            >
              <span className="text-gray-300 font-medium">Add New Product</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              to="/sales-orders" 
              className="p-3 bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-lg flex items-center justify-between text-sm transition-all"
            >
              <span className="text-gray-300 font-medium">Create Sales Order</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              to="/purchase-orders" 
              className="p-3 bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-lg flex items-center justify-between text-sm transition-all"
            >
              <span className="text-gray-300 font-medium">Issue Purchase Order</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
            <Link 
              to="/grn" 
              className="p-3 bg-gray-900/40 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-lg flex items-center justify-between text-sm transition-all"
            >
              <span className="text-gray-300 font-medium">Receive Shipments (GRN)</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
