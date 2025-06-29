import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProductVariantModal.css";

const ProductVariantModal = ({ product, onClose, onPreOrder }) => {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchProductVariants();
  }, [product.id]);

  const fetchProductVariants = async () => {
    try {
      const response = await axios.get(
        `https://newcrafts.onrender.com/api/products/${product.id}`
      );
      setVariants(response.data.variants || []);

      if (response.data.variants && response.data.variants.length > 0) {
        const firstVariant = response.data.variants[0];
        setSelectedVariant(firstVariant);
        setCurrentImages(firstVariant.images || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching variants:", error);
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setCurrentImages(variant.images || []);
    setCurrentImageIndex(0);
  };

  const calculateVariantPrice = (variant) => {
    const basePrice = parseFloat(product.base_price);
    return (basePrice + parseFloat(variant.price_modifier)).toFixed(2);
  };

  const calculateTotalPrice = () => {
    if (!selectedVariant) return 0;
    const variantPrice = calculateVariantPrice(selectedVariant);
    return (parseFloat(variantPrice) * quantity).toFixed(2);
  };

  const calculateDownPayment = () => {
    const totalPrice = calculateTotalPrice();
    return (parseFloat(totalPrice) * 0.2).toFixed(2); // 20% down payment
  };

  const calculateRemainingAmount = () => {
    const totalPrice = calculateTotalPrice();
    const downPayment = calculateDownPayment();
    return (parseFloat(totalPrice) - parseFloat(downPayment)).toFixed(2);
  };

  const handlePreOrder = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert("Please fill in all customer information");
      return;
    }

    try {
      const preOrderData = {
        customer_info: customerInfo,
        variant_id: selectedVariant.id,
        quantity: quantity,
        total_amount: calculateTotalPrice(),
      };

      const response = await axios.post(
        "https://newcrafts.onrender.com/api/preorders",
        preOrderData
      );

      alert(`Pre-order placed successfully! 
      Order ID: ${response.data.orderId}
      Down Payment: ₹${response.data.downPayment}
      Remaining: ₹${response.data.remainingAmount}`);

      onClose();
    } catch (error) {
      console.error("Error placing pre-order:", error);
      alert("Failed to place pre-order. Please try again.");
    }
  };

  const nextImage = () => {
    if (currentImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
    }
  };

  const prevImage = () => {
    if (currentImages.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + currentImages.length) % currentImages.length
      );
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="loading">Loading product variants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{product.name}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="product-image-section">
            <div className="main-image">
              {currentImages.length > 0 ? (
                <>
                  <img
                    src={`https://newcrafts.onrender.com/${currentImages[currentImageIndex].url}`}
                    alt={`${product.name} - ${selectedVariant?.variant_type}`}
                    className="product-main-image"
                  />
                  {currentImages.length > 1 && (
                    <>
                      <button className="image-nav prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button className="image-nav next" onClick={nextImage}>
                        ›
                      </button>
                    </>
                  )}
                  <div className="image-indicators">
                    {currentImages.map((_, index) => (
                      <span
                        key={index}
                        className={`indicator ${
                          index === currentImageIndex ? "active" : ""
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-image">No Image Available</div>
              )}
            </div>
          </div>

          <div className="product-details-section">
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="base-price">Base Price: ₹{product.base_price}</p>
              <p className="description">{product.description}</p>
            </div>

            <div className="variants-section">
              <h4>Select Metal Type:</h4>
              <div className="variants-grid">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`variant-option ${
                      selectedVariant?.id === variant.id ? "selected" : ""
                    }`}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <div className="variant-header">
                      <h5>
                        {variant.variant_type.charAt(0).toUpperCase() +
                          variant.variant_type.slice(1)}
                      </h5>
                      <span className="variant-price">
                        ₹{calculateVariantPrice(variant)}
                      </span>
                    </div>
                    <div className="price-breakdown">
                      <small>
                        Base: ₹{product.base_price} + ₹{variant.price_modifier}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedVariant && (
              <>
                <div className="quantity-section">
                  <h4>Quantity:</h4>
                  <div className="quantity-controls">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= selectedVariant.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                  <small>Available: {selectedVariant.stock_quantity}</small>
                </div>

                <div className="customer-info-section">
                  <h4>Customer Information:</h4>
                  <div className="customer-form">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                    <textarea
                      placeholder="Address"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: e.target.value,
                        })
                      }
                      rows="3"
                    />
                  </div>
                </div>

                <div className="price-summary">
                  <h4>Price Summary:</h4>
                  <div className="price-details">
                    <p>Unit Price: ₹{calculateVariantPrice(selectedVariant)}</p>
                    <p>Quantity: {quantity}</p>
                    <p>
                      <strong>Total Price: ₹{calculateTotalPrice()}</strong>
                    </p>
                    <p className="down-payment">
                      <strong>
                        Down Payment (20%): ₹{calculateDownPayment()}
                      </strong>
                    </p>
                    <p>Remaining Amount: ₹{calculateRemainingAmount()}</p>
                  </div>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button
                className="preorder-btn"
                onClick={handlePreOrder}
                disabled={
                  !selectedVariant ||
                  !customerInfo.name ||
                  !customerInfo.email ||
                  !customerInfo.phone
                }
              >
                Place Pre-Order (Pay ₹{calculateDownPayment()})
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;
