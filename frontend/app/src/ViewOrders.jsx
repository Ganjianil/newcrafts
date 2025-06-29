

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewOrders.css";

const ViewOrders = () => {
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [expandedOrder, setExpandedOrder] = useState(null);
const [updatingStatus, setUpdatingStatus] = useState(null);

useEffect(() => {
fetchOrders();
}, []);

const fetchOrders = async () => {
try {
const response = await axios.get(
  "https://newcrafts.onrender.com/admin/orders"
);
setOrders(response.data);
setLoading(false);
} catch (error) {
console.error("Error fetching orders:", error);
setLoading(false);
}
};

const updateOrderStatus = async (orderId, status) => {
try {
setUpdatingStatus(orderId);
await axios.put(`https://newcrafts.onrender.com/order/${orderId}/status`, {
  status,
});
alert(`Order status updated to ${status}. Customer has been notified via email.`);
fetchOrders(); // Refresh the list
} catch (error) {
console.error("Error updating order status:", error);
alert("Failed to update order status");
} finally {
setUpdatingStatus(null);
}
};

const toggleOrderDetails = (orderId) => {
setExpandedOrder(expandedOrder === orderId ? null : orderId);
};

const getStatusColor = (status) => {
switch (status?.toLowerCase()) {
case 'processing': return '#ffa500';
case 'shipped': return '#2196f3';
case 'delivered': return '#4caf50';
case 'cancelled': return '#f44336';
default: return '#757575';
}
};

const getStatusActions = (currentStatus) => {
const status = currentStatus?.toLowerCase();
const actions = [];

if (status === 'processing' || status === 'pending') {
actions.push('shipped', 'cancelled');
} else if (status === 'shipped') {
actions.push('delivered');
}

return actions;
};

if (loading) {
return <div className="loading">Loading orders...</div>;
}

// Group orders by order_id
const groupedOrders = orders.reduce((acc, order) => {
if (!acc[order.order_id]) {
acc[order.order_id] = {
order_id: order.order_id,
order_date: order.order_date,
status: order.status,
username: order.username,
// Address details
name: order.name,
email: order.email,
phone: order.phone,
street: order.street,
city: order.city,
zip: order.zip,
country: order.country,
items: [],
total: 0,
};
}
acc[order.order_id].items.push({
product_name: order.product_name,
product_price: order.product_price,
quantity: order.quantity || 1,
});
acc[order.order_id].total += parseFloat(order.product_price) * (order.quantity || 1);
return acc;
}, {});

const ordersList = Object.values(groupedOrders);

return (
<div className="view-orders">
<div className="orders-header">
<h2>All Orders Management</h2>
<div className="orders-stats">
<div className="stat-card">
<h3>{ordersList.length}</h3>
<p>Total Orders</p>
</div>
<div className="stat-card">
<h3>{ordersList.filter(o => o.status === 'processing').length}</h3>
<p>Processing</p>
</div>
<div className="stat-card">
<h3>{ordersList.filter(o => o.status === 'shipped').length}</h3>
<p>Shipped</p>
</div>
<div className="stat-card">
<h3>{ordersList.filter(o => o.status === 'delivered').length}</h3>
<p>Delivered</p>
</div>
</div>
</div>

{ordersList.length === 0 ? (
<div className="no-orders">
<h3>No orders found</h3>
<p>No orders have been placed yet.</p>
</div>
) : (
<div className="orders-list">
{ordersList.map((order) => (
<div key={order.order_id} className="order-card">
<div className="order-header">
<div className="order-basic-info">
<h3>Order #{order.order_id}</h3>
<div className="order-meta">
<p><strong>Customer:</strong> {order.username}</p>
<p><strong>Contact:</strong> {order.name}</p>
<p><strong>Email:</strong> {order.email}</p>
<p><strong>Phone:</strong> {order.phone}</p>
<p><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
<p>
<strong>Status:</strong>
<span 
className="status-badge" 
style={{ backgroundColor: getStatusColor(order.status) }}
>
{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
</span>
</p>
<p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
</div>
</div>
<div className="order-actions-header">
<button
onClick={() => toggleOrderDetails(order.order_id)}
className="toggle-details-btn"
>
{expandedOrder === order.order_id ? "Hide Details" : "View Details"}
</button>
</div>
</div>

{expandedOrder === order.order_id && (
<div className="order-details">
{/* Customer Address Information */}
<div className="address-section">
<h4>🏠 Delivery Address</h4>
<div className="address-card">
<div className="address-row">
<div className="address-field">
<label>Full Name:</label>
<span>{order.name}</span>
</div>
<div className="address-field">
<label>Email:</label>
<span>{order.email}</span>
</div>
</div>
<div className="address-row">
<div className="address-field">
<label>Phone:</label>
<span>{order.phone}</span>
</div>
<div className="address-field">
<label>ZIP Code:</label>
<span>{order.zip}</span>
</div>
</div>
<div className="address-field full-width">
<label>Street Address:</label>
<span>{order.street}</span>
</div>
<div className="address-row">
<div className="address-field">
<label>City:</label>
<span>{order.city}</span>
</div>
<div className="address-field">
<label>Country:</label>
<span>{order.country}</span>
</div>
</div>
</div>
</div>

{/* Order Items */}
<div className="order-items">
<h4>📦 Order Items ({order.items.length})</h4>
<div className="items-table">
<div className="table-header">
<span>Product Name</span>
<span>Quantity</span>
<span>Unit Price</span>
<span>Total</span>
</div>
{order.items.map((item, index) => (
<div key={index} className="table-row">
<span>{item.product_name}</span>
<span>{item.quantity}</span>
<span>₹{item.product_price}</span>
<span>₹{(parseFloat(item.product_price) * item.quantity).toFixed(2)}</span>
</div>
))}
<div className="table-footer">
<span><strong>Grand Total:</strong></span>
<span></span>
<span></span>
<span><strong>₹{order.total.toFixed(2)}</strong></span>
</div>
</div>
</div>

{/* Order Actions */}
<div className="order-actions">
<h4>⚡ Update Order Status</h4>
<div className="current-status">
<p>Current Status: <span 
className="status-badge" 
style={{ backgroundColor: getStatusColor(order.status) }}
>
{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
</span></p>
</div>
<div className="status-buttons">
{getStatusActions(order.status).map((status) => (
<button
key={status}
onClick={() => updateOrderStatus(order.order_id, status)}
className={`status-btn ${status}`}
disabled={updatingStatus === order.order_id}
>
{updatingStatus === order.order_id ? 'Updating...' : 
`Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
</button>
))}
</div>
<div className="status-info">
<p><small>📧 Customer will be automatically notified via email when status is updated.</small></p>
</div>
</div>
</div>
)}
</div>
))}
</div>
)}
</div>
);
};

export default ViewOrders;
