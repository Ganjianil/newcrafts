import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Cart.css";

const Cart = ({ isAuthenticated, cartItems, setCartItems }) => {
  const [loading, setLoading] = useState(true);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  const [addressForm, setAddressForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    country: "India",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://newcrafts.onrender.com/viewcart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setLoading(false);
    }
  };

  // Remove individual item from cart
  const removeFromCart = async (itemId) => {
    setRemovingItems((prev) => new Set(prev).add(itemId));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://newcrafts.onrender.com/cart/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update cart items locally
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );

      // Recalculate discount if coupon is applied
      if (appliedCoupon) {
        calculateDiscount(cartItems.filter((item) => item.id !== itemId));
      }

      alert("Item removed from cart successfully!");
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert("Failed to remove item from cart");
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setClearingCart(true);
      try {
        const token = localStorage.getItem("token");
        await axios.delete("https://newcrafts.onrender.com/cart/clear", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartItems([]);
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode("");
        alert("Cart cleared successfully!");
      } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Failed to clear cart");
      } finally {
        setClearingCart(false);
      }
    }
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://newcrafts.onrender.com/apply-coupon",
        { coupon_code: couponCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAppliedCoupon(response.data.coupon);
      calculateDiscount(cartItems, response.data.coupon);
      alert("Coupon applied successfully!");
    } catch (error) {
      console.error("Error applying coupon:", error);
      alert(error.response?.data?.error || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Calculate discount based on coupon
  const calculateDiscount = (items, coupon = appliedCoupon) => {
    if (!coupon || !items.length) {
      setDiscount(0);
      return;
    }

    const subtotal = items.reduce(
      (total, item) =>
        total + parseFloat(item.product_price) * (item.quantity || 1),
      0
    );

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else if (coupon.discount_type === "fixed") {
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }

    setDiscount(discountAmount);
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, phone, street, city, zip } = addressForm;
    if (!name.trim()) {
      alert("Please enter your full name");
      return false;
    }
    if (!email.trim()) {
      alert("Please enter your email address");
      return false;
    }
    if (!phone.trim()) {
      alert("Please enter your phone number");
      return false;
    }
    if (!street.trim()) {
      alert("Please enter your street address");
      return false;
    }
    if (!city.trim()) {
      alert("Please enter your city");
      return false;
    }
    if (!zip.trim()) {
      alert("Please enter your ZIP/postal code");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    if (phone.length < 10) {
      alert("Please enter a valid phone number (at least 10 digits)");
      return false;
    }

    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Sending checkout request with address:", addressForm);

      const checkoutData = {
        address: {
          name: addressForm.name.trim(),
          email: addressForm.email.trim(),
          phone: addressForm.phone.trim(),
          street: addressForm.street.trim(),
          city: addressForm.city.trim(),
          zip: addressForm.zip.trim(),
          country: addressForm.country,
        },
      };

      // Add coupon code if applied
      if (appliedCoupon) {
        checkoutData.coupon_code = appliedCoupon.code;
      }

      const response = await axios.post(
        "https://newcrafts.onrender.com/checkout",
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Checkout response:", response.data);

      // Set success message with order details
      setOrderSuccess({
        orderId: response.data.orderId,
        totalAmount: response.data.totalAmount,
        discount: response.data.discount || 0,
        orderDetails: response.data.orderDetails,
      });

      // Clear cart and form
      setCartItems([]);
      setShowCheckoutForm(false);
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponCode("");
      setAddressForm({
        name: "",
        email: "",
        phone: "",
        street: "",
        city: "",
        zip: "",
        country: "India",
      });

      // Show success message
      alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
      let errorMessage = "Checkout failed. Please try again.";
      if (error.response) {
        console.error("Server error response:", error.response.data);
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      alert(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleCancelCheckout = () => {
    setShowCheckoutForm(false);
    setAddressForm({
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      zip: "",
      country: "India",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="auth-message">
          <h2>Please login to view your cart</h2>
          <a href="/login" className="login-link">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + parseFloat(item.product_price) * (item.quantity || 1),
    0
  );

  const totalAmount = subtotal - discount;

  // Show order success message
  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="order-success">
          <div className="success-icon">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <div className="success-details">
            <div className="detail-item">
              <strong>Order ID:</strong>
              <span>{orderSuccess.orderId}</span>
            </div>
            <div className="detail-item">
              <strong>Subtotal:</strong>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {orderSuccess.discount > 0 && (
              <div className="detail-item discount">
                <strong>Discount:</strong>
                <span>-₹{orderSuccess.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="detail-item total">
              <strong>Total Amount:</strong>
              <span>₹{orderSuccess.totalAmount.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <strong>Delivery Address:</strong>
              <div className="delivery-address">
                <p>{orderSuccess.orderDetails.name}</p>
                <p>{orderSuccess.orderDetails.email}</p>
                <p>{orderSuccess.orderDetails.phone}</p>
                <p>{orderSuccess.orderDetails.address}</p>
              </div>
            </div>
          </div>
          <div className="success-actions">
            <button
              onClick={() => setOrderSuccess(null)}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
            <a href="/orders" className="view-orders-btn">
              View My Orders
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart ({cartItems.length} items)</h2>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            disabled={clearingCart}
            className="clear-all-btn"
          >
            {clearingCart ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <a href="/categories" className="continue-shopping-btn">
            Continue Shopping
          </a>
        </div>
      ) : (
        <>
          {!showCheckoutForm ? (
            <div className="cart-content">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-details">
                      <h3>{item.product_name}</h3>
                      <p className="item-description">{item.descripition}</p>
                      <div className="item-pricing">
                        <span className="item-price">
                          ₹{item.product_price}
                        </span>
                        <span className="item-quantity">
                          Qty: {item.quantity || 1}
                        </span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={removingItems.has(item.id)}
                        className="remove-item-btn"
                      >
                        {removingItems.has(item.id) ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-details">
                  <h3>Order Summary</h3>

                  {/* Coupon Section */}
                  <div className="coupon-section">
                    <h4>Apply Coupon</h4>
                    {!appliedCoupon ? (
                      <div className="coupon-input-group">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          className="coupon-input"
                        />
                        <button
                          onClick={applyCoupon}
                          disabled={couponLoading}
                          className="apply-coupon-btn"
                        >
                          {couponLoading ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    ) : (
                      <div className="applied-coupon">
                        <div className="coupon-info">
                          <span className="coupon-code">
                            🎫 {appliedCoupon.code}
                          </span>
                          <span className="coupon-discount">
                            {appliedCoupon.discount_type === "percentage"
                              ? `${appliedCoupon.discount_value}% OFF`
                              : `₹${appliedCoupon.discount_value} OFF`}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="remove-coupon-btn"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="summary-line">
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="summary-line discount">
                      <span>Discount:</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="summary-line total">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-actions">
                  <button
                    onClick={handleProceedToCheckout}
                    className="checkout-btn"
                  >
                    Proceed to Checkout
                  </button>
                  <a href="/categories" className="continue-shopping-link">
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="checkout-container">
              <div className="checkout-header">
                <h2>Checkout</h2>
                <button
                  onClick={handleCancelCheckout}
                  className="back-to-cart-btn"
                >
                  ← Back to Cart
                </button>
              </div>

              <div className="checkout-content">
                <div className="checkout-form-section">
                  <h3>Delivery Address</h3>
                  <form onSubmit={handleCheckout} className="checkout-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={addressForm.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={addressForm.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={addressForm.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zip">ZIP/Postal Code *</label>
                        <input
                          type="text"
                          id="zip"
                          name="zip"
                          value={addressForm.zip}
                          onChange={handleInputChange}
                          placeholder="Enter ZIP code"
                          required
                        />
                      </div>
                      <div className="form-group full-width">
                        <label htmlFor="street">Street Address *</label>
                        <input
                          type="text"
                          id="street"
                          name="street"
                          value={addressForm.street}
                          onChange={handleInputChange}
                          placeholder="Enter your street address"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={addressForm.city}
                          onChange={handleInputChange}
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <select
                          id="country"
                          name="country"
                          value={addressForm.country}
                          onChange={handleInputChange}
                        >
                          <option value="India">India</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={handleCancelCheckout}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={checkoutLoading}
                        className="place-order-btn"
                      >
                        {checkoutLoading ? (
                          <>
                            <span className="loading-spinner small"></span>
                            Placing Order...
                          </>
                        ) : (
                          `Place Order - ₹${totalAmount.toFixed(2)}`
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="order-summary-section">
                  <h3>Order Summary</h3>
                  <div className="summary-items">
                    {cartItems.map((item) => (
                      <div key={item.id} className="summary-item">
                        <div className="item-info">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-qty">
                            Qty: {item.quantity || 1}
                          </span>
                        </div>
                        <span className="item-total">
                          ₹{item.product_price}
                        </span>
                      </div>
                    ))}
                  </div>

                  {appliedCoupon && (
                    <div className="checkout-coupon-info">
                      <div className="coupon-applied">
                        <span>🎫 {appliedCoupon.code}</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div className="summary-total">
                    <div className="subtotal-line">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="discount-line">
                        <span>Discount:</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="total-line">
                      <span>Total Amount:</span>
                      <span className="total-amount">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
