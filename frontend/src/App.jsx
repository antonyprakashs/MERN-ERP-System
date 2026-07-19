import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import SalesOrders from './pages/SalesOrders';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import GRN from './pages/GRN';
import Invoices from './pages/Invoices';
import AdminUsers from './pages/AdminUsers';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Main Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    
                    <Route path="/products" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Inventory']}>
                        <Products />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/customers" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                        <Customers />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/sales-orders" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                        <SalesOrders />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/suppliers" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Inventory']}>
                        <Suppliers />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/purchase-orders" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Inventory']}>
                        <PurchaseOrders />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/grn" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Inventory']}>
                        <GRN />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/invoices" element={
                      <ProtectedRoute allowedRoles={['Admin', 'Sales']}>
                        <Invoices />
                      </ProtectedRoute>
                    } />

                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminUsers />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        
        {/* Global Notifications Container */}
        <ToastContainer 
          position="bottom-right" 
          autoClose={4000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
