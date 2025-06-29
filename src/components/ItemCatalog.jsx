import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemVariantSelector from "./ItemVariantSelector";
import "./ItemCatalog.css";

const ItemCatalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:3001/api/items");
      console.log("Items response:", response.data);
      setItems(response.data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load items. Please try again later.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    console.log("Item clicked:", item);
    setSelectedItem(item);
    setShowVariantModal(true);
  };

  const calculatePriceRange = (item) => {
    try {
      if (!item || !item.base_cost) {
        return "₹0";
      }

      const basePrice = parseFloat(item.base_cost) || 0;

      if (
        !item.options ||
        !Array.isArray(item.options) ||
        item.options.length === 0
      ) {
        return `₹${basePrice.toFixed(2)}`;
      }

      const prices = item.options.map((option) => {
        const extraCost = parseFloat(option.extra_cost) || 0;
        return basePrice + extraCost;
      });

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return `₹${minPrice.toFixed(2)}`;
      }

      return `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
    } catch (error) {
      console.error("Error calculating price range:", error);
      return "₹0";
    }
  };

  const closeModal = () => {
    setShowVariantModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="loading-spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchItems} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="item-catalog">
      <div className="catalog-header">
        <h1>Product Catalog</h1>
        <p>Choose from our premium collection with variant options</p>
      </div>

      {items.length === 0 ? (
        <div className="no-items">
          <h3>No items available</h3>
          <p>Please check back later or contact support.</p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => {
            // Safely extract item properties
            const itemId = item.id || Math.random();
            const itemTitle = item.title || item.name || "Untitled Item";
            const itemDescription =
              item.description || "No description available";
            const mainImage = item.main_image || item.image_url || null;
            const hasOptions =
              item.hasOptions ||
              (item.options &&
                Array.isArray(item.options) &&
                item.options.length > 0);
            const optionsArray = Array.isArray(item.options)
              ? item.options
              : [];

            return (
              <div
                key={itemId}
                className="item-card"
                onClick={() => handleItemClick(item)}
              >
                <div className="item-image">
                  {mainImage ? (
                    <img
                      src={`http://localhost:3001/${mainImage}`}
                      alt={itemTitle}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="no-image"
                    style={{ display: mainImage ? "none" : "flex" }}
                  >
                    No Image
                  </div>
                  <div className="item-overlay">
                    <button className="view-options-btn">
                      {hasOptions ? "View Options" : "View Details"}
                    </button>
                  </div>
                </div>

                <div className="item-info">
                  <h3>{itemTitle}</h3>
                  <p className="item-description">{itemDescription}</p>
                  <div className="item-pricing">
                    <span className="price-range">
                      {calculatePriceRange(item)}
                    </span>
                    {hasOptions && (
                      <span className="options-count">
                        {optionsArray.length} option
                        {optionsArray.length !== 1 ? "s" : ""} available
                      </span>
                    )}
                  </div>

                  {hasOptions && optionsArray.length > 0 && (
                    <div className="option-preview">
                      {optionsArray.slice(0, 3).map((option, index) => (
                        <span key={index} className="option-tag">
                          {option.option_name ||
                            option.name ||
                            `Option ${index + 1}`}
                        </span>
                      ))}
                      {optionsArray.length > 3 && (
                        <span className="more-options">
                          +{optionsArray.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showVariantModal && selectedItem && (
        <ItemVariantSelector item={selectedItem} onClose={closeModal} />
      )}
    </div>
  );
};

export default ItemCatalog;
