import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {
  const [productData, setProductData] = useState({
    product_name: "",
    product_price: "",
    descripition: "",
    category_id: "",
    is_preorder: false,
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(
        "http://localhost:10406/categories/active"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear messages when user starts typing
    if (message) setMessage("");
    if (error) setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    // Clear messages when user selects files
    if (message) setMessage("");
    if (error) setError("");
  };

  const validateForm = () => {
    if (!productData.product_name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!productData.product_price || productData.product_price <= 0) {
      setError("Valid product price is required");
      return false;
    }
    if (!productData.descripition.trim()) {
      setError("Product description is required");
      return false;
    }
    if (!productData.category_id) {
      setError("Please select a category");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("product_name", productData.product_name);
      formData.append("product_price", productData.product_price);
      formData.append("descripition", productData.descripition);
      formData.append("category_id", productData.category_id);
      formData.append("is_preorder", productData.is_preorder);

      // Append images
      images.forEach((image) => {
        formData.append("images", image);
      });

      console.log("Submitting product:", {
        product_name: productData.product_name,
        product_price: productData.product_price,
        descripition: productData.descripition,
        category_id: productData.category_id,
        is_preorder: productData.is_preorder,
        imageCount: images.length,
      });

      const response = await axios.post(
        "http://localhost:10406/products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Product added successfully:", response.data);
      setMessage("Product added successfully!");

      // Reset form
      setProductData({
        product_name: "",
        product_price: "",
        descripition: "",
        category_id: "",
        is_preorder: false,
      });
      setImages([]);

      // Reset file input
      const fileInput = document.getElementById("images");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to add product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setProductData({
      product_name: "",
      product_price: "",
      descripition: "",
      category_id: "",
      is_preorder: false,
    });
    setImages([]);
    setMessage("");
    setError("");

    // Reset file input
    const fileInput = document.getElementById("images");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-header">
        <h2>Add New Product</h2>
        <p>Fill in the details below to add a new product to your inventory</p>
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

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-group">
          <label htmlFor="product_name">Product Name *</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={productData.product_name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Category *</label>
          {categoriesLoading ? (
            <div className="loading-select">Loading categories...</div>
          ) : (
            <select
              id="category_id"
              name="category_id"
              value={productData.category_id}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.product_count} products)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="product_price">Product Price (₹) *</label>
          <input
            type="number"
            id="product_price"
            name="product_price"
            value={productData.product_price}
            onChange={handleInputChange}
            placeholder="Enter product price"
            min="0"
            step="0.01"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripition">Product Description *</label>
          <textarea
            id="descripition"
            name="descripition"
            value={productData.descripition}
            onChange={handleInputChange}
            placeholder="Enter product description"
            rows="4"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_preorder"
              checked={productData.is_preorder}
              onChange={handleInputChange}
              disabled={loading}
            />
            <span className="checkbox-text">Pre-order Product</span>
          </label>
          <small className="form-help">
            Check this if the product is available for pre-order with
            customization options
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="images">Product Images</label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            disabled={loading}
          />
          <small className="form-help">
            You can select multiple images. Supported formats: JPG, PNG, GIF
          </small>
          {images.length > 0 && (
            <div className="selected-files">
              <p>Selected files: {images.length}</p>
              <ul>
                {images.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </button>
          <button
            type="button"
            onClick={clearForm}
            disabled={loading}
            className="clear-btn"
          >
            Clear Form
          </button>
        </div>
      </form>

      <div className="form-info">
        <h3>Tips for adding products:</h3>
        <ul>
          <li>Use clear, descriptive product names</li>
          <li>Select the appropriate category for better organization</li>
          <li>Set competitive and accurate prices</li>
          <li>Write detailed descriptions to help customers</li>
          <li>Upload high-quality images for better presentation</li>
          <li>Enable pre-order for customizable products</li>
          <li>All fields marked with * are required</li>
        </ul>
      </div>
    </div>
  );
};

export default AddProduct;
