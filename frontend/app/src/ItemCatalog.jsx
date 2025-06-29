import React, { useState, useEffect } from "react";
import axios from "axios";
import ItemVariantSelector from "./ItemVariantSelector";


const ItemCatalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // Use your existing backend endpoint
      const response = await axios.get("http://localhost:10406/viewproducts");

      // Transform the data to work with the catalog format
      const transformedItems = response.data.map((product) => ({
        id: product.id,
        title: product.product_name,
        description: product.descripition,
        base_cost: product.product_price,
        brand: "Nandini Crafts",
        category: product.category || "general",
        main_image: product.image_path,
        hasOptions: product.is_preorder, // Only preorder products have variants
        options: [], // Will be fetched when item is clicked
      }));

      setItems(transformedItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    if (item.hasOptions) {
      try {
        // Fetch variants for this product
        const response = await axios.get(
          `http://localhost:10406/products/${item.id}/variants-with-images`
        );

        // Transform variants to match expected format
        const transformedVariants = response.data.map((variant) => ({
          id: variant.id,
          option_name: variant.variant_name,
          option_type: variant.variant_type,
          extra_cost: variant.additional_price,
          stock_count: 10, // Default stock
          images: variant.image_path ? [variant.image_path] : [],
        }));

        const itemWithVariants = {
          ...item,
          options: transformedVariants,
        };

        setSelectedItem(itemWithVariants);
        setShowVariantModal(true);
      } catch (error) {
        console.error("Error fetching variants:", error);
        // If no variants, treat as regular product
        setSelectedItem(item);
        setShowVariantModal(true);
      }
    } else {
      // Regular product without variants
      setSelectedItem(item);
      setShowVariantModal(true);
    }
  };

  const calculatePriceRange = (item) => {
    if (!item.hasOptions) {
      return `₹${item.base_cost}`;
    }

    // For preorder items, show base price with "+" to indicate variants
    return `₹${item.base_cost}+`;
  };

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="loading-spinner"></div>
        <p>Loading items...</p>
      </div>
    );
  }

  return (
    <div className="item-catalog">
      <div className="catalog-header">
        <h1>Product Catalog</h1>
        <p>Choose from our premium collection with variant options</p>
      </div>

      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="item-card"
            onClick={() => handleItemClick(item)}
          >
            <div className="item-image">
              {item.main_image ? (
                <img
                  src={`http://localhost:10406/${item.main_image}`}
                  alt={item.title}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="item-overlay">
                <button className="view-options-btn">
                  {item.hasOptions ? "View Variants" : "View Details"}
                </button>
              </div>
            </div>

            <div className="item-info">
              <h3>{item.title}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-pricing">
                <span className="price-range">{calculatePriceRange(item)}</span>
                {item.hasOptions && (
                  <span className="options-count">Variants available</span>
                )}
              </div>

              {item.hasOptions && (
                <div className="option-preview">
                  <span className="option-tag">Brass</span>
                  <span className="option-tag">Silver</span>
                  <span className="option-tag">Copper</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showVariantModal && selectedItem && (
        <ItemVariantSelector
          item={selectedItem}
          onClose={() => setShowVariantModal(false)}
        />
      )}
    </div>
  );
};

export default ItemCatalog;
