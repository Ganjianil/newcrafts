import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "./Orders.css";

const Orders = ({ isAuthenticated }) => {
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [cancellingOrder, setCancellingOrder] = useState(null);

useEffect(() => {
if (isAuthenticated) {
fetchOrders();
}
}, [isAuthenticated]);

const fetchOrders = async () => {
try {
const token = localStorage.getItem("token");
const response = await axios.get("http://localhost:10406/myorders", {
headers: {
Authorization: `Bearer ${token}`,
},
});
// Group orders by order_id
const groupedOrders = response.data.reduce((acc, order) => {
if (!acc[order.order_id]) {
acc[order.order_id] = {
order_id: order.order_id,
order_date: order.order_date,
status: order.status || 'processing',
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
setOrders(Object.values(groupedOrders));
setLoading(false);
} catch (error) {
console.error("Error fetching orders:", error);
setLoading(false);
}
};

const cancelOrder = async (orderId) => {
try {
setCancellingOrder(orderId);
const token = localStorage.getItem("token");
await axios.put(`http://localhost:10406/order/${orderId}/cancel`, {}, {
headers: {
Authorization: `Bearer ${token}`,
},
});
alert("Order cancelled successfully");
fetchOrders(); // Refresh orders
} catch (error) {
console.error("Error cancelling order:", error);
alert("Failed to cancel order");
} finally {
setCancellingOrder(null);
}
};

const downloadInvoice = async (orderId) => {
try {
const token = localStorage.getItem("token");
const response = await axios.get(`http://localhost:10406/order/${orderId}/invoice`, {
headers: {
Authorization: `Bearer ${token}`,
},
responseType: 'blob',
});

const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', `invoice-${orderId}.pdf`);
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
} catch (error) {
console.error("Error downloading invoice:", error);
alert("Failed to download invoice");
}
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

const canCancelOrder = (status) => {
return ['processing', 'pending'].includes(status?.toLowerCase());
};

if (!isAuthenticated) {
return <Navigate to="/login" replace />;
}

if (loading) {
return <div className="loading">Loading your orders...</div>;
}

return (
<div className="orders-page">
<div className="container">
<div className="page-header">
<h1>My Orders</h1>
<p>Track your order history and status</p>
</div>

{orders.length === 0 ? (
<div className="no-orders">
<h3>No orders found</h3>
<p>You haven't placed any orders yet.</p>
</div>
) : (
<div className="orders-list">
{orders.map((order) => (
<div key={order.order_id} className="order-card">
<div className="order-header">
<div className="order-info">
<h3>Order #{order.order_id}</h3>
<p className="order-date">
Placed on {new Date(order.order_date).toLocaleDateString()}
</p>
<div className="order-status">
<span 
className="status-badge" 
style={{ backgroundColor: getStatusColor(order.status) }}
>
{order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Processing'}
</span>
</div>
</div>
<div className="order-total">
<span className="total-label">Total</span>
<span className="total-amount">₹{order.total.toFixed(2)}</span>
</div>
</div>

<div className="order-items">
<h4>Items ({order.items.length})</h4>
<div className="items-list">
{order.items.map((item, index) => (
<div key={index} className="order-item">
<span className="item-name">{item.product_name}</span>
<span className="item-quantity">Qty: {item.quantity}</span>
<span className="item-price">₹{item.product_price}</span>
</div>
))}
</div>
</div>

<div className="delivery-address">
<h4>Delivery Address</h4>
<div className="address-info">
<p><strong>{order.name}</strong></p>
<p>{order.email} | {order.phone}</p>
<p>{order.street}</p>
<p>{order.city}, {order.zip}</p>
<p>{order.country}</p>
</div>
</div>

<div className="order-actions">
<button 
className="btn-secondary"
onClick={() => downloadInvoice(order.order_id)}
>
📄 Download Invoice
</button>

{canCancelOrder(order.status) && (
<button 
className="btn-danger"
onClick={() => cancelOrder(order.order_id)}
disabled={cancellingOrder === order.order_id}
>
{cancellingOrder === order.order_id ? 'Cancelling...' : '❌ Cancel Order'}
</button>
)}
</div>
</div>
))}
</div>
)}
</div>
</div>
);
};

export default Orders;
