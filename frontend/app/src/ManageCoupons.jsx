import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageCoupons.css";

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount: "",
    expiry_date: "",
    is_active: true,
    usage_limit: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://newcrafts.onrender.com/admin/coupons"
      );
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setError("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearMessages();
  };

  const clearMessages = () => {
    if (message) setMessage("");
    if (error) setError("");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_discount: "",
      expiry_date: "",
      is_active: true,
      usage_limit: "",
    });
    setEditingCoupon(null);
    setShowForm(false);
    clearMessages();
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      setError("Coupon code is required");
      return false;
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      setError("Valid discount value is required");
      return false;
    }

    if (
      formData.discount_type === "percentage" &&
      formData.discount_value > 100
    ) {
      setError("Percentage discount cannot exceed 100%");
      return false;
    }

    if (formData.expiry_date && new Date(formData.expiry_date) <= new Date()) {
      setError("Expiry date must be in the future");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    clearMessages();

    try {
      const dataToSend = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        min_order_amount: formData.min_order_amount || 0,
        max_discount: formData.max_discount || null,
        usage_limit: formData.usage_limit || null,
        expiry_date: formData.expiry_date || null,
      };

      if (editingCoupon) {
        await axios.put(
          `https://newcrafts.onrender.com/admin/coupons/${editingCoupon.id}`,
          dataToSend
        );
        setMessage("Coupon updated successfully!");
      } else {
        await axios.post(
          "https://newcrafts.onrender.com/admin/coupons",
          dataToSend
        );
        setMessage("Coupon created successfully!");
      }

      await fetchCoupons();
      resetForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      setError(error.response?.data?.error || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || "",
      max_discount: coupon.max_discount || "",
      expiry_date: coupon.expiry_date ? coupon.expiry_date.split("T")[0] : "",
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit || "",
    });
    setShowForm(true);
    clearMessages();
  };

  const handleDelete = async (couponId, couponCode) => {
    if (
      !window.confirm(
        `Are you sure you want to delete coupon "${couponCode}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `https://newcrafts.onrender.com/admin/coupons/${couponId}`
      );
      setMessage("Coupon deleted successfully!");
      await fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      setError(error.response?.data?.error || "Failed to delete coupon");
    }
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      const coupon = coupons.find((c) => c.id === couponId);
      const updatedData = {
        ...coupon,
        is_active: !currentStatus,
        expiry_date: coupon.expiry_date
          ? coupon.expiry_date.split("T")[0]
          : null,
      };

      await axios.put(
        `https://newcrafts.onrender.com/admin/coupons/${couponId}`,
        updatedData
      );
      setMessage(
        `Coupon ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
      await fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon status:", error);
      setError("Failed to update coupon status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No expiry";
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) <= new Date();
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `₹${coupon.discount_value} OFF`;
    }
  };

  if (loading) {
    return (
      <div className="manage-coupons-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-coupons-container">
      <div className="manage-coupons-header">
        <h2>Manage Coupons</h2>
        <button
          onClick={() => setShowForm(true)}
          className="add-coupon-btn"
          disabled={showForm}
        >
          + Add New Coupon
        </button>
      </div>

      {message && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="coupon-form-container">
          <div className="coupon-form-header">
            <h3>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
            <button onClick={resetForm} className="close-form-btn">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="coupon-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code">Coupon Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter coupon code (e.g., SAVE20)"
                  required
                  disabled={submitting}
                  style={{ textTransform: "uppercase" }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="discount_type">Discount Type *</label>
                <select
                  id="discount_type"
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="discount_value">
                  Discount Value *{" "}
                  {formData.discount_type === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  id="discount_value"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  placeholder={
                    formData.discount_type === "percentage"
                      ? "e.g., 10"
                      : "e.g., 500"
                  }
                  min="0"
                  max={
                    formData.discount_type === "percentage" ? "100" : undefined
                  }
                  step="0.01"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="min_order_amount">
                  Minimum Order Amount (₹)
                </label>
                <input
                  type="number"
                  id="min_order_amount"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="max_discount">Maximum Discount (₹)</label>
                <input
                  type="number"
                  id="max_discount"
                  name="max_discount"
                  value={formData.max_discount}
                  onChange={handleInputChange}
                  placeholder="e.g., 2000"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                <small className="form-help">
                  Leave empty for no maximum limit
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="usage_limit">Usage Limit</label>
                <input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  min="1"
                  disabled={submitting}
                />
                <small className="form-help">
                  Leave empty for unlimited usage
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiry_date">Expiry Date</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={submitting}
                />
                <small className="form-help">Leave empty for no expiry</small>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  <span className="checkbox-text">Active Coupon</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter coupon description"
                rows="3"
                disabled={submitting}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="submit-btn"
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    {editingCoupon ? "Updating..." : "Creating..."}
                  </>
                ) : editingCoupon ? (
                  "Update Coupon"
                ) : (
                  "Create Coupon"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="coupons-list">
        <div className="coupons-grid">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-header">
                <div className="coupon-code">{coupon.code}</div>
                <div
                  className={`status-badge ${
                    coupon.is_active ? "active" : "inactive"
                  }`}
                >
                  {coupon.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="coupon-discount">
                <span className="discount-value">
                  {getDiscountDisplay(coupon)}
                </span>
                {coupon.min_order_amount > 0 && (
                  <span className="min-order">
                    Min. order: ₹{coupon.min_order_amount}
                  </span>
                )}
              </div>

              <div className="coupon-info">
                <p className="coupon-description">
                  {coupon.description || "No description available"}
                </p>

                <div className="coupon-details">
                  <div className="detail-item">
                    <span className="label">Type:</span>
                    <span className="value">
                      {coupon.discount_type === "percentage"
                        ? "Percentage"
                        : "Fixed Amount"}
                    </span>
                  </div>

                  {coupon.max_discount && (
                    <div className="detail-item">
                      <span className="label">Max Discount:</span>
                      <span className="value">₹{coupon.max_discount}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <span className="label">Usage:</span>
                    <span className="value">
                      {coupon.used_count || 0}
                      {coupon.usage_limit
                        ? ` / ${coupon.usage_limit}`
                        : " / Unlimited"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Expires:</span>
                    <span
                      className={`value ${
                        isExpired(coupon.expiry_date) ? "expired" : ""
                      }`}
                    >
                      {formatDate(coupon.expiry_date)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">
                      {new Date(coupon.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="coupon-actions">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="edit-btn"
                  title="Edit Coupon"
                >
                  ✏️
                </button>
                <button
                  onClick={() =>
                    toggleCouponStatus(coupon.id, coupon.is_active)
                  }
                  className={`toggle-btn ${
                    coupon.is_active ? "deactivate" : "activate"
                  }`}
                  title={coupon.is_active ? "Deactivate" : "Activate"}
                >
                  {coupon.is_active ? "🔒" : "🔓"}
                </button>
                <button
                  onClick={() => handleDelete(coupon.id, coupon.code)}
                  className="delete-btn"
                  title="Delete Coupon"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No coupons found</h3>
            <p>Create your first coupon to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoupons;
