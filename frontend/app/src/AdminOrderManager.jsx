import React, { useState, useEffect } from 'react';
import axios from 'axios';


const AdminOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://newcrafts.onrender.com/api/advance-orders"
      );
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.payment_status === statusFilter);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'advance_paid': 'status-advance-paid',
      'fully_paid': 'status-fully-paid',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-order-manager">
      <div className="admin-header">
        <h1>Advance Order Management</h1>
        <div className="filter-section">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="advance_paid">Advance Paid</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>No advance orders match the selected filter.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Advance Paid</th>
                <th>Balance</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Delivery Date</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.full_name}</div>
                      <div className="customer-email">{order.email_address}</div>
                      <div className="customer-phone">{order.phone_number}</div>
                    </div>
                  </td>
                  <td>{order.item_title}</td>
                  <td>
                    <span className="variant-badge">{order.option_name}</span>
                  </td>
                  <td>{order.quantity_ordered}</td>
                  <td>₹{parseFloat(order.total_cost).toFixed(2)}</td>
                  <td>₹{parseFloat(order.advance_payment).toFixed(2)}</td>
                  <td>₹{parseFloat(order.balance_amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(order.payment_status)}`}>
                      {order.payment_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(order.order_status)}`}>
                      {order.order_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(order.delivery_date).toLocaleDateString()}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManager;