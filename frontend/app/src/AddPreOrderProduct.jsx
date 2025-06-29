import React, { useState } from "react";
import axios from "axios";
import "./AddPreOrderProduct.css";

const AddPreOrderProduct = () => {
  const [productData, setProductData] = useState({
    product_name: "",
    product_price: "",
    descripition: "",
  });

  const [variants, setVariants] = useState([
    {
      variant_name: "Brass",
      variant_type: "metal",
      price_multiplier: 1.0,
      additional_price: 0.0,
      description: "Traditional brass finish with golden appearance",
      image: null,
      imagePreview: null,
    },
    {
      variant_name: "Silver",
      variant_type: "metal",
      price_multiplier: 1.0,
      additional_price: 500.0,
      description: "Premium silver plating with elegant shine",
      image: null,
      imagePreview: null,
    },
    {
      variant_name: "Copper",
      variant_type: "metal",
      price_multiplier: 1.0,
      additional_price: 200.0,
      description: "Antique copper finish with rustic appeal",
      image: null,
      imagePreview: null,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (message) setMessage("");
    if (error) setError("");
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    if (field === "price_multiplier" || field === "additional_price") {
      const numValue = parseFloat(value);
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: isNaN(numValue) ? 0 : numValue,
      };
    } else {
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value,
      };
    }
    setVariants(updatedVariants);
  };

  const handleVariantImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedVariants = [...variants];
      if (updatedVariants[index].imagePreview) {
        URL.revokeObjectURL(updatedVariants[index].imagePreview);
      }
      updatedVariants[index] = {
        ...updatedVariants[index],
        image: file,
        imagePreview: URL.createObjectURL(file),
      };
      setVariants(updatedVariants);
    }
  };

  const removeVariantImage = (index) => {
    const updatedVariants = [...variants];
    if (updatedVariants[index].imagePreview) {
      URL.revokeObjectURL(updatedVariants[index].imagePreview);
    }
    updatedVariants[index] = {
      ...updatedVariants[index],
      image: null,
      imagePreview: null,
    };
    setVariants(updatedVariants);
    const fileInput = document.getElementById(`variant-image-${index}`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    if (!productData.product_name.trim()) {
      setError("Product name is required");
      return false;
    }
    const price = parseFloat(productData.product_price);
    if (!productData.product_price || isNaN(price) || price <= 0) {
      setError("Valid product price is required");
      return false;
    }
    if (!productData.descripition.trim()) {
      setError("Product description is required");
      return false;
    }
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      if (!variant.variant_name.trim()) {
        setError(`Variant ${i + 1} name is required`);
        return false;
      }
      if (variant.additional_price < 0) {
        setError(`Variant ${i + 1} additional price cannot be negative`);
        return false;
      }
      if (!variant.image) {
        setError(`Please upload an image for ${variant.variant_name} variant`);
        return false;
      }
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
      // Step 1: Create FormData for ONE product with all variant images
      const formData = new FormData();
      formData.append("product_name", productData.product_name.trim());
      formData.append(
        "product_price",
        parseFloat(productData.product_price).toString()
      );
      formData.append("descripition", productData.descripition.trim());

      // Append ALL variant images to the SAME product
      variants.forEach((variant) => {
        if (variant.image) {
          formData.append("images", variant.image);
        }
      });

      console.log("Creating ONE product with multiple variant images...");

      // Step 1: Create ONE product with all images
      const productResponse = await axios.post(
        "http://localhost:10406/products/preorder",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Product creation response:", productResponse.data);

      if (!productResponse.data.success || !productResponse.data.productId) {
        throw new Error(
          productResponse.data.error || "Failed to create product"
        );
      }

      // Step 2: Add variants and link them to images
      const formattedVariants = variants.map((variant) => ({
        variant_name: variant.variant_name.trim(),
        variant_type: variant.variant_type || "metal",
        price_multiplier: parseFloat(variant.price_multiplier) || 1.0,
        additional_price: parseFloat(variant.additional_price) || 0.0,
        description: variant.description || "",
      }));

      console.log("Adding variants to the single product...");
      const variantsResponse = await axios.post(
        `http://localhost:10406/products/${productResponse.data.productId}/variants`,
        {
          variants: formattedVariants,
          imageIds: productResponse.data.imageIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Variants response:", variantsResponse.data);

      if (!variantsResponse.data.success) {
        throw new Error(
          variantsResponse.data.error || "Failed to add variants"
        );
      }

      setMessage("Pre-order product with variants added successfully!");
      clearForm();
    } catch (error) {
      console.error("Error adding pre-order product:", error);
      let errorMessage = "Failed to add pre-order product. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = String(error.response.data.error);
      } else if (error.response?.data?.details) {
        errorMessage = String(error.response.data.details);
      } else if (error.message) {
        errorMessage = String(error.message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    variants.forEach((variant) => {
      if (variant.imagePreview) {
        URL.revokeObjectURL(variant.imagePreview);
      }
    });

    setProductData({
      product_name: "",
      product_price: "",
      descripition: "",
    });

    setVariants([
      {
        variant_name: "Brass",
        variant_type: "metal",
        price_multiplier: 1.0,
        additional_price: 0.0,
        description: "Traditional brass finish with golden appearance",
        image: null,
        imagePreview: null,
      },
      {
        variant_name: "Silver",
        variant_type: "metal",
        price_multiplier: 1.0,
        additional_price: 500.0,
        description: "Premium silver plating with elegant shine",
        image: null,
        imagePreview: null,
      },
      {
        variant_name: "Copper",
        variant_type: "metal",
        price_multiplier: 1.0,
        additional_price: 200.0,
        description: "Antique copper finish with rustic appeal",
        image: null,
        imagePreview: null,
      },
    ]);

    setMessage("");
    setError("");

    variants.forEach((_, index) => {
      const fileInput = document.getElementById(`variant-image-${index}`);
      if (fileInput) {
        fileInput.value = "";
      }
    });
  };

  const calculateVariantPrice = (variant) => {
    const basePrice = parseFloat(productData.product_price) || 0;
    return (
      basePrice * parseFloat(variant.price_multiplier) +
      parseFloat(variant.additional_price)
    ).toFixed(2);
  };

  const calculateDownPayment = (variant) => {
    const totalPrice = calculateVariantPrice(variant);
    return (totalPrice * 0.2).toFixed(2); // 20% down payment
  };

  return (
    <div className="add-preorder-product-container">
      <div className="add-preorder-product-header">
        <h2>Add Pre-order Product</h2>
        <p>
          Create ONE product with THREE metal variants (like Flipkart color
          selection)
        </p>
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

      <form onSubmit={handleSubmit} className="add-preorder-product-form">
        {/* Basic Product Information */}
        <div className="form-section">
          <h3>Product Information</h3>
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
            <label htmlFor="product_price">Base Price (₹) *</label>
            <input
              type="number"
              id="product_price"
              name="product_price"
              value={productData.product_price}
              onChange={handleInputChange}
              placeholder="Enter base price"
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
            <small className="form-help">
              This is the base price. Variants will modify this price.
            </small>
          </div>
          <div className="form-group">
            <label htmlFor="descripition">Product Description *</label>
            <textarea
              id="descripition"
              name="descripition"
              value={productData.descripition}
              onChange={handleInputChange}
              placeholder="Enter detailed product description"
              rows="4"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Metal Variants Section */}
        <div className="form-section">
          <div className="variants-header">
            <h3>Metal Variants (Like Flipkart Color Options)</h3>
            <p>Configure the three metal variants for this single product</p>
          </div>
          <div className="variants-grid">
            {variants.map((variant, index) => (
              <div key={index} className="variant-card">
                <div className="variant-header">
                  <h4>
                    Variant {index + 1}: {variant.variant_name}
                  </h4>
                </div>
                <div className="variant-form">
                  <div className="form-group">
                    <label>Variant Name *</label>
                    <input
                      type="text"
                      value={variant.variant_name}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "variant_name",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Brass, Silver, Copper"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Variant Image Upload */}
                  <div className="form-group">
                    <label htmlFor={`variant-image-${index}`}>
                      {variant.variant_name} Image *
                    </label>
                    <input
                      type="file"
                      id={`variant-image-${index}`}
                      accept="image/*"
                      onChange={(e) => handleVariantImageChange(index, e)}
                      disabled={loading}
                    />
                    <small className="form-help">
                      Upload an image showing the product in{" "}
                      {variant.variant_name} finish
                    </small>
                    {/* Image Preview */}
                    {variant.imagePreview && (
                      <div className="variant-image-preview">
                        <div className="preview-container">
                          <img
                            src={variant.imagePreview}
                            alt={`${variant.variant_name} preview`}
                            className="variant-preview-img"
                          />
                          <button
                            type="button"
                            className="remove-variant-image-btn"
                            onClick={() => removeVariantImage(index)}
                            disabled={loading}
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                        <p className="preview-label">
                          {variant.variant_name} Preview
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price Multiplier *</label>
                      <input
                        type="number"
                        value={variant.price_multiplier}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "price_multiplier",
                            e.target.value
                          )
                        }
                        placeholder="1.00"
                        min="0.1"
                        step="0.01"
                        required
                        disabled={loading}
                      />
                      <small>Base price × multiplier</small>
                    </div>
                    <div className="form-group">
                      <label>Additional Price (₹)</label>
                      <input
                        type="number"
                        value={variant.additional_price}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "additional_price",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={loading}
                      />
                      <small>Extra cost for this variant</small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Variant Description</label>
                    <textarea
                      value={variant.description}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Describe this metal variant..."
                      rows="2"
                      disabled={loading}
                    />
                  </div>

                  {productData.product_price && (
                    <div className="variant-price-preview">
                      <strong>
                        Final Price: ₹{calculateVariantPrice(variant)}
                      </strong>
                      <br />
                      <strong>
                        Down Payment (20%): ₹{calculateDownPayment(variant)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding Product...
              </>
            ) : (
              "Add Pre-order Product"
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
        <h3>Pre-order Product Guidelines:</h3>
        <ul>
          <li>
            ONE product will be created with THREE metal variants (like
            Flipkart)
          </li>
          <li>
            Each variant (Brass, Silver, Copper) should have its own image
          </li>
          <li>
            Base price is multiplied by variant multiplier, then additional
            price is added
          </li>
          <li>Customers pay 20% down payment, remaining 80% on delivery</li>
          <li>Estimated delivery time is 30 days from order confirmation</li>
          <li>
            Each variant should have a clear description of the metal finish
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AddPreOrderProduct;
