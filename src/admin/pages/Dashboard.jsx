import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch all orders
      const { data: orders, error } = await supabase.from('orders').select('*');
      if (error) throw error;

      // Fetch counts for products and categories
      const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { count: categoriesCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });

      let pending = 0;
      let completed = 0;
      let dailyRev = 0;
      let monthlyRev = 0;

      const now = new Date();
      const todayString = now.toISOString().split('T')[0];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      orders?.forEach(order => {
        if (order.status === 'pending') pending++;
        if (order.status === 'completed') completed++;

        const orderDate = new Date(order.created_at);
        if (orderDate.toISOString().split('T')[0] === todayString) {
          dailyRev += Number(order.total_amount);
        }
        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          monthlyRev += Number(order.total_amount);
        }
      });

      setMetrics({
        pendingOrders: pending,
        completedOrders: completed,
        dailyRevenue: dailyRev,
        monthlyRevenue: monthlyRev,
        totalProducts: productsCount || 0,
        totalCategories: categoriesCount || 0
      });

    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTransactions = async (type) => {
    // Generate CSV for either monthly or yearly
    try {
      const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      const now = new Date();
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        if (type === 'monthly') {
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        } else if (type === 'yearly') {
          return orderDate.getFullYear() === now.getFullYear();
        }
        return true;
      });

      if (filteredOrders.length === 0) {
        alert('No transactions found for this period.');
        return;
      }

      // Build CSV
      const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Total Amount', 'Status', 'Date'];
      const csvRows = [headers.join(',')];
      
      filteredOrders.forEach(order => {
        const row = [
          order.id,
          `"${order.customer_name}"`,
          order.customer_email,
          order.total_amount,
          order.status,
          new Date(order.created_at).toLocaleString()
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${type}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate CSV', err);
      alert('Failed to generate CSV');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => downloadTransactions('monthly')}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Monthly CSV
          </button>
          <button 
            onClick={() => downloadTransactions('yearly')}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Yearly CSV
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading metrics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalProducts}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Categories</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalCategories}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.pendingOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Completed Orders</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.completedOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Daily Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">₹{metrics.dailyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">₹{metrics.monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
