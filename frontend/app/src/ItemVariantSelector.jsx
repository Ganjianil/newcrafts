import React, { useState, useEffect } from "react";
import axios from "axios";
import AdvanceOrderForm from "./AdvanceOrderForm";


const ItemVariantSelector = ({ item, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    if (item && item.options && item.options.length > 0) {
      setSelectedOption(item.options[0]);
    }
  }, [item]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setCurrentImageIndex(0);
  };

  const calculateFinalPrice = () => {
    if (!selectedOption) return item.base_cost;
    return (
      (parseFloat(item.base_cost) + parseFloat(selectedOption.extra_cost)) *
      quantity
    );
  };

  const calculateAdvancePayment = () => {
    return (calculateFinalPrice() * 0.2).toFixed(2); // 20% advance
  };

  const calculateBalanceAmount = () => {
    return (
      calculateFinalPrice() - parseFloat(calculateAdvancePayment())
    ).toFixed(2);
  };

  const handleAdvanceOrder = () => {
    setShowOrderForm(true);
  };

  const nextImage = () => {
    if (selectedOption && selectedOption.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedOption.images.length);
    }
  };

  const prevImage = () => {
    if (selectedOption && selectedOption.images.length > 1) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + selectedOption.images.length) %
          selectedOption.images.length
      );
    }
  };

  if (showOrderForm) {
    return (
      <AdvanceOrderForm
        item={item}
        selectedOption={selectedOption}
        quantity={quantity}
        onClose={onClose}
        onBack={() => setShowOrderForm(false)}
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="variant-modal">
        <div className="modal-header">
          <h2>{item.title}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="image-section">
            <div className="main-image-container">
              {selectedOption && selectedOption.images.length > 0 ? (
                <>
                  <img
                    src={`http://localhost:10406/${selectedOption.images[currentImageIndex]}`}
                    alt={`${item.title} - ${selectedOption.option_name}`}
                    className="main-image"
                  />
                  {selectedOption.images.length > 1 && (
                    <>
                      <button className="image-nav prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button className="image-nav next" onClick={nextImage}>
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : item.main_image ? (
                <img
                  src={`http://localhost:10406/${item.main_image}`}
                  alt={item.title}
                  className="main-image"
                />
              ) : (
                <div className="no-image">No Image Available</div>
              )}
            </div>
          </div>

          <div className="details-section">
            <div className="item-info">
              <h3>{item.title}</h3>
              <p className="base-price">Base Price: ₹{item.base_cost}</p>
              <p className="description">{item.description}</p>
              {item.brand && <p className="brand">Brand: {item.brand}</p>}
            </div>

            {item.hasOptions && item.options && item.options.length > 0 ? (
              <>
                <div className="options-section">
                  <h4>Select Variant:</h4>
                  <div className="options-grid">
                    {item.options.map((option) => (
                      <div
                        key={option.id}
                        className={`option-card ${
                          selectedOption?.id === option.id ? "selected" : ""
                        }`}
                        onClick={() => handleOptionSelect(option)}
                      >
                        <div className="option-header">
                          <h5>{option.option_name}</h5>
                          <span className="option-price">
                            ₹
                            {(
                              parseFloat(item.base_cost) +
                              parseFloat(option.extra_cost)
                            ).toFixed(2)}
                          </span>
                        </div>
                        {option.extra_cost > 0 && (
                          <p className="extra-cost">+₹{option.extra_cost}</p>
                        )}
                        <p className="stock-info">
                          Stock: {option.stock_count}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

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
                      disabled={
                        selectedOption && quantity >= selectedOption.stock_count
                      }
                    >
                      +
                    </button>
                  </div>
                  <small>
                    Available:{" "}
                    {selectedOption ? selectedOption.stock_count : "N/A"}
                  </small>
                </div>

                <div className="pricing-summary">
                  <h4>Pricing Summary:</h4>
                  <div className="price-breakdown">
                    <div className="price-row">
                      <span>Total Price:</span>
                      <span>₹{calculateFinalPrice().toFixed(2)}</span>
                    </div>
                    <div className="price-row advance">
                      <span>Advance Payment (20%):</span>
                      <span>₹{calculateAdvancePayment()}</span>
                    </div>
                    <div className="price-row">
                      <span>Balance on Delivery:</span>
                      <span>₹{calculateBalanceAmount()}</span>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="advance-order-btn"
                    onClick={handleAdvanceOrder}
                  >
                    Place Advance Order (₹{calculateAdvancePayment()})
                  </button>
                  <button className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="no-variants">
                <p>This is a regular product without variants.</p>
                <div className="action-buttons">
                  <button className="add-to-cart-btn" onClick={onClose}>
                    Add to Cart
                  </button>
                  <button className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemVariantSelector;
