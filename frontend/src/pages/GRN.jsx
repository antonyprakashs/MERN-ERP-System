import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { FileCheck, Calendar, User, ShieldAlert } from 'lucide-react';

const GRN = () => {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/grn');
      // Sort: newest first
      const sorted = [...data].sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived));
      setGrns(sorted);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load Goods Receipt Notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNs();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-display">Goods Receipt Notes (GRN)</h1>
        <p className="text-gray-400 text-sm mt-1">Audit log of all supplier stock shipments received and checked in</p>
      </div>

      {/* GRN Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading logs...</p>
          </div>
        ) : grns.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No shipments have been received yet. (Use Purchase Orders to check in goods).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-gray-900/40 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-6">GRN Document ID</th>
                  <th className="py-3.5 px-6">Linked PO</th>
                  <th className="py-3.5 px-6">Supplier</th>
                  <th className="py-3.5 px-6">Received Items</th>
                  <th className="py-3.5 px-6">Date Checked</th>
                  <th className="py-3.5 px-6 text-right">Checked By Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {grns.map((grn) => (
                  <tr key={grn._id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs text-white">#GRN-{grn._id.substring(18)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-300">
                      #PO-{grn.purchaseOrder?._id?.substring(18) || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-300">
                      {grn.purchaseOrder?.supplier?.name || 'Unknown Supplier'}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="space-y-1 text-xs">
                        {grn.purchaseOrder?.products?.map((item, idx) => (
                          <div key={idx} className="text-gray-300">
                            {item.product?.title || 'Unknown Product'} <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        )) || <span className="text-gray-600">No items listed</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center text-xs space-x-1.5 text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(grn.dateReceived).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center space-x-2 text-xs">
                        <div className="flex flex-col text-right">
                          <span className="font-semibold text-white">{grn.checkedBy?.name || 'System'}</span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase">{grn.checkedBy?.role || 'Staff'}</span>
                        </div>
                        <div className="p-1.5 bg-gray-900 border border-gray-800 rounded-md text-gray-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      </div>
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

export default GRN;
