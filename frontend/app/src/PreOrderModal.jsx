import React, { useState } from "react";
import axios from "axios";
import "./PreOrderModal.css";

const PreOrderModal = ({ orderData, onClose, onSuccess }) => {
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!customerData.customer_name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!customerData.customer_email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!customerData.customer_phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!customerData.customer_address.trim()) {
      setError("Address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const preorderData = {
        ...customerData,
        product_id: orderData.product.id,
        variant_id: orderData.variant.id,
        quantity: orderData.quantity,
      };

      const response = await axios.post(
        "http://localhost:10406/preorder",
        preorderData
      );

      if (response.data.success) {
        onSuccess(response.data);
      } else {
        setError(response.data.error || "Failed to place pre-order");
      }
    } catch (error) {
      console.error("Pre-order error:", error);
      setError(error.response?.data?.error || "Failed to place pre-order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="preorder-modal-container">
        <div className="modal-header">
          <h2>Complete Your Pre-Order</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <p>
                <strong>Product:</strong> {orderData.product.product_name}
              </p>
              <p>
                <strong>Variant:</strong> {orderData.variant.variant_name}
              </p>
              <p>
                <strong>Quantity:</strong> {orderData.quantity}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{orderData.totalAmount}
              </p>
              <p className="down-payment">
                <strong>Down Payment (20%):</strong> ₹{orderData.downPayment}
              </p>
              <p>
                <strong>Remaining Amount:</strong> ₹{orderData.remainingAmount}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="customer-form">
            <h3>Customer Information</h3>

            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="customer_name">Full Name *</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={customerData.customer_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_email">Email Address *</label>
              <input
                type="email"
                id="customer_email"
                name="customer_email"
                value={customerData.customer_email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_phone">Phone Number *</label>
              <input
                type="tel"
                id="customer_phone"
                name="customer_phone"
                value={customerData.customer_phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customer_address">Address *</label>
              <textarea
                id="customer_address"
                name="customer_address"
                value={customerData.customer_address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                rows="3"
                required
                disabled={loading}
              />
            </div>

            <div className="payment-info">
              <h4>Payment Information</h4>
              <p>
                You need to pay <strong>₹{orderData.downPayment}</strong> as
                down payment (20% of total amount).
              </p>
              <p>
                Remaining amount of{" "}
                <strong>₹{orderData.remainingAmount}</strong> will be collected
                upon delivery.
              </p>
              <p className="delivery-info">
                Estimated delivery: 30 days from order confirmation
              </p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="place-order-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Placing Order...
                  </>
                ) : (
                  `Place Pre-Order (Pay ₹${orderData.downPayment})`
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreOrderModal;
