import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManagePreOrders.css";

const ManagePreOrders = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreOrder, setSelectedPreOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/admin/preorders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      setPreOrders(response.data);
    } catch (error) {
      console.error("Error fetching pre-orders:", error);
      alert("Failed to fetch pre-orders");
    } finally {
      setLoading(false);
    }
  };

  const updatePreOrderStatus = async (preOrderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/preorders/${preOrderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      // Update local state
      setPreOrders(
        preOrders.map((order) =>
          order.id === preOrderId
            ? { ...order, payment_status: newStatus }
            : order
        )
      );

      alert("Pre-order status updated successfully");
    } catch (error) {
      console.error("Error updating pre-order status:", error);
      alert("Failed to update pre-order status");
    }
  };

  const deletePreOrder = async (preOrderId) => {
    if (!window.confirm("Are you sure you want to delete this pre-order?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/admin/preorders/${preOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      setPreOrders(preOrders.filter((order) => order.id !== preOrderId));
      alert("Pre-order deleted successfully");
    } catch (error) {
      console.error("Error deleting pre-order:", error);
      alert("Failed to delete pre-order");
    }
  };

  const deleteAllPreOrders = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL pre-orders? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete("http://localhost:5000/api/admin/preorders/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      setPreOrders([]);
      alert("All pre-orders deleted successfully");
    } catch (error) {
      console.error("Error deleting all pre-orders:", error);
      alert("Failed to delete all pre-orders");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "down_paid":
        return "status-down-paid";
      case "fully_paid":
        return "status-fully-paid";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getOrderStatusBadgeClass = (status) => {
    switch (status) {
      case "placed":
        return "order-status-placed";
      case "in_production":
        return "order-status-production";
      case "ready":
        return "order-status-ready";
      case "delivered":
        return "order-status-delivered";
      default:
        return "order-status-placed";
    }
  };

  const filteredPreOrders =
    statusFilter === "all"
      ? preOrders
      : preOrders.filter((order) => order.payment_status === statusFilter);

  if (loading) {
    return (
      <div className="manage-preorders">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading pre-orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-preorders">
      <div className="preorders-header">
        <h2>Manage Pre-Orders</h2>
        <div className="header-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="down_paid">Down Payment Paid</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={deleteAllPreOrders}
            className="delete-all-btn"
            disabled={preOrders.length === 0}
          >
            🗑️ Delete All
          </button>
        </div>
      </div>

      {filteredPreOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No pre-orders found</h3>
          <p>
            {statusFilter === "all"
              ? "No pre-orders have been placed yet."
              : `No pre-orders with status "${statusFilter}" found.`}
          </p>
        </div>
      ) : (
        <div className="preorders-table-container">
          <table className="preorders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Down Payment</th>
                <th>Remaining</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPreOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">
                        {order.customer_name || "N/A"}
                      </div>
                      <div className="customer-email">
                        {order.customer_email || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td>{order.product_name}</td>
                  <td>
                    <span className="variant-badge">{order.variant_type}</span>
                  </td>
                  <td>{order.quantity}</td>
                  <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>₹{parseFloat(order.down_payment).toFixed(2)}</td>
                  <td>₹{parseFloat(order.remaining_amount).toFixed(2)}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getOrderStatusBadgeClass(
                        order.order_status
                      )}`}
                    >
                      {order.order_status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => {
                          setSelectedPreOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="view-btn"
                        title="View Details"
                      >
                        👁️
                      </button>
                      <select
                        value={order.payment_status}
                        onChange={(e) =>
                          updatePreOrderStatus(order.id, e.target.value)
                        }
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="down_paid">Down Paid</option>
                        <option value="fully_paid">Fully Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => deletePreOrder(order.id)}
                        className="delete-btn"
                        title="Delete Pre-order"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pre-order Details Modal */}
      {showDetailsModal && selectedPreOrder && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>Pre-order Details - #{selectedPreOrder.id}</h3>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedPreOrder.customer_name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedPreOrder.customer_email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedPreOrder.customer_phone || "N/A"}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Product Information</h4>
                  <p>
                    <strong>Product:</strong> {selectedPreOrder.product_name}
                  </p>
                  <p>
                    <strong>Variant:</strong> {selectedPreOrder.variant_type}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {selectedPreOrder.quantity}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Payment Information</h4>
                  <p>
                    <strong>Total Amount:</strong> ₹
                    {parseFloat(selectedPreOrder.total_amount).toFixed(2)}
                  </p>
                  <p>
                    <strong>Down Payment (20%):</strong> ₹
                    {parseFloat(selectedPreOrder.down_payment).toFixed(2)}
                  </p>
                  <p>
                    <strong>Remaining Amount:</strong> ₹
                    {parseFloat(selectedPreOrder.remaining_amount).toFixed(2)}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Order Information</h4>
                  <p>
                    <strong>Payment Status:</strong>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        selectedPreOrder.payment_status
                      )}`}
                    >
                      {selectedPreOrder.payment_status
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </p>
                  <p>
                    <strong>Order Status:</strong>
                    <span
                      className={`status-badge ${getOrderStatusBadgeClass(
                        selectedPreOrder.order_status
                      )}`}
                    >
                      {selectedPreOrder.order_status
                        .replace("_", " ")
                        .toUpperCase()}
                    </span>
                  </p>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(selectedPreOrder.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>Expected Delivery:</strong>{" "}
                    {selectedPreOrder.expected_delivery
                      ? new Date(
                          selectedPreOrder.expected_delivery
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {selectedPreOrder.notes && (
                <div className="detail-section">
                  <h4>Customer Notes</h4>
                  <p className="notes-text">{selectedPreOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePreOrders;
