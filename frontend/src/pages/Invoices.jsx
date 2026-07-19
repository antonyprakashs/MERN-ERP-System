import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { FileText, Calendar, DollarSign, CheckCircle2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const exportInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE BILLING", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Ref: #INV-${invoice._id.substring(18).toUpperCase()}`, 14, 32);
    doc.text(`Date Billed: ${new Date(invoice.dateGenerated).toLocaleString()}`, 14, 37);
    doc.text(`Payment Status: ${invoice.status}`, 14, 42);
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 47, 196, 47);
    
    // Customer Info
    const customer = invoice.salesOrder?.customer;
    doc.setFont("helvetica", "bold");
    doc.text("BILLED TO:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${customer?.name || 'N/A'}`, 14, 61);
    doc.text(`Contact: ${customer?.contact || 'N/A'}`, 14, 67);
    doc.text(`Address: ${customer?.address || 'N/A'}`, 14, 73);
    
    doc.line(14, 79, 196, 79);
    
    // Table Header
    doc.setFont("helvetica", "bold");
    doc.text("ITEM DETAILS", 14, 87);
    doc.text("QTY", 120, 87);
    doc.text("UNIT PRICE", 140, 87);
    doc.text("SUBTOTAL", 170, 87);
    
    doc.line(14, 91, 196, 91);
    
    // Items list
    doc.setFont("helvetica", "normal");
    let yPosition = 98;
    const products = invoice.salesOrder?.products || [];
    
    products.forEach((item) => {
      const title = item.product?.title || 'Unknown Product';
      const quantity = item.quantity || 0;
      const price = item.product?.price || 0;
      const subtotal = price * quantity;
      
      doc.text(title, 14, yPosition);
      doc.text(quantity.toString(), 120, yPosition);
      doc.text(`$${price.toFixed(2)}`, 140, yPosition);
      doc.text(`$${subtotal.toFixed(2)}`, 170, yPosition);
      
      yPosition += 8;
    });
    
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 8;
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL AMOUNT DUE:", 120, yPosition);
    doc.text(`$${invoice.amount.toLocaleString()}`, 170, yPosition);
    
    doc.save(`Invoice-${invoice._id.substring(18).toUpperCase()}.pdf`);
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/invoices');
      // Sort: newest first
      const sorted = [...data].sort((a, b) => new Date(b.dateGenerated) - new Date(a.dateGenerated));
      setInvoices(sorted);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Invoices list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (id) => {
    if (!window.confirm('Mark this invoice as Paid?')) return;
    try {
      await API.put(`/invoices/${id}`, { status: 'Paid' });
      toast.success('Invoice payment processed successfully!');
      fetchInvoices();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update payment status';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Invoices & Billing</h1>
        <p className="text-gray-400 text-sm mt-1">Audit customer accounts receivable invoices and payment logs</p>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading billing registry...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No invoices generated yet. (Use Sales Orders to generate billing invoices).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-6">Invoice Number</th>
                  <th className="py-3.5 px-6">Sales Order</th>
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">Billed Amount</th>
                  <th className="py-3.5 px-6">Date Billed</th>
                  <th className="py-3.5 px-6">Payment Status</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Billing Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-primary-500/10 border border-primary-500/20 rounded-md text-primary-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs text-white">#INV-{inv._id.substring(18)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-300">
                      #{inv.salesOrder?._id?.substring(18) || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-300">
                      {inv.salesOrder?.customer?.name || 'Unknown Customer'}
                    </td>
                    <td className="py-4 px-6 text-white font-semibold text-base">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-xs space-x-1.5 text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(inv.dateGenerated).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {inv.status === 'Unpaid' && (
                        <button
                          onClick={() => handleMarkAsPaid(inv._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
                          <span>Process Payment</span>
                        </button>
                      )}
                      <button
                        onClick={() => exportInvoicePDF(inv)}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-semibold shadow-sm border border-gray-750 transition-colors cursor-pointer inline-flex items-center space-x-1"
                        title="Export Invoice as PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
