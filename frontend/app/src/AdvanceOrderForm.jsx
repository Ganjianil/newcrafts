import React, { useState } from "react";
import axios from "axios";


const AdvanceOrderForm = ({
  item,
  selectedOption,
  quantity,
  onClose,
  onBack,
}) => {
  const [buyerInfo, setBuyerInfo] = useState({
    full_name: "",
    email_address: "",
    phone_number: "",
    address_details: "",
  });
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleInputChange = (e) => {
    setBuyerInfo({
      ...buyerInfo,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalCost = () => {
    return (
      (parseFloat(item.base_cost) + parseFloat(selectedOption.extra_cost)) *
      quantity
    );
  };

  const calculateAdvancePayment = () => {
    return (calculateTotalCost() * 0.2).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        buyer_info: buyerInfo,
        item_id: item.id,
        option_id: selectedOption.id,
        quantity_ordered: quantity,
      };

      const response = await axios.post(
        "https://newcrafts.onrender.com/api/advance-orders",
        orderData
      );

      if (response.data.success) {
        setOrderDetails(response.data);
        setOrderSuccess(true);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="modal-overlay">
        <div className="order-success-modal">
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
          </div>

          <div className="order-summary">
            <h3>Order Details</h3>
            <div className="summary-row">
              <span>Order ID:</span>
              <span>#{orderDetails.orderId}</span>
            </div>
            <div className="summary-row">
              <span>Item:</span>
              <span>{item.title}</span>
            </div>
            <div className="summary-row">
              <span>Variant:</span>
              <span>{selectedOption.option_name}</span>
            </div>
            <div className="summary-row">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="summary-row">
              <span>Total Amount:</span>
              <span>₹{orderDetails.orderDetails.total_cost}</span>
            </div>
            <div className="summary-row highlight">
              <span>Advance Paid:</span>
              <span>₹{orderDetails.orderDetails.advance_payment}</span>
            </div>
            <div className="summary-row">
              <span>Balance on Delivery:</span>
              <span>₹{orderDetails.orderDetails.balance_amount}</span>
            </div>
            <div className="summary-row">
              <span>Expected Delivery:</span>
              <span>{orderDetails.orderDetails.delivery_date}</span>
            </div>
          </div>

          <div className="success-actions">
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="order-form-modal">
        <div className="modal-header">
          <h2>Complete Your Advance Order</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="order-summary-section">
          <h3>Order Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>
                {item.title} - {selectedOption.option_name}
              </span>
              <span>Qty: {quantity}</span>
            </div>
            <div className="summary-pricing">
              <div className="price-row">
                <span>Total Amount:</span>
                <span>₹{calculateTotalCost().toFixed(2)}</span>
              </div>
              <div className="price-row advance-highlight">
                <span>Advance Payment (20%):</span>
                <span>₹{calculateAdvancePayment()}</span>
              </div>
              <div className="price-row">
                <span>Balance on Delivery:</span>
                <span>
                  ₹
                  {(
                    calculateTotalCost() - parseFloat(calculateAdvancePayment())
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="buyer-form">
          <h3>Buyer Information</h3>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={buyerInfo.full_name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email_address"
              value={buyerInfo.email_address}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone_number"
              value={buyerInfo.phone_number}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label>Address Details</label>
            <textarea
              name="address_details"
              value={buyerInfo.address_details}
              onChange={handleInputChange}
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="back-btn" onClick={onBack}>
              Back to Selection
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Processing..."
                : `Pay Advance ₹${calculateAdvancePayment()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvanceOrderForm;
