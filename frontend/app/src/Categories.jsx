import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductVariantModal from "./ProductVariantModal";
import PreOrderModal from "./PreOrderModal";

import ProductRating from "./ProductRating";
import DiscountBadge from "./DiscountBadge";
import {
  safeStringify,
  safeRender,
  safeLog,
  getNestedValue,
} from "./objectUtils";
import "./Categories.css";

const Categories = ({ isAuthenticated, setCartItems }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchActiveCoupons();
  }, []);

  useEffect(() => {
    safeLog("Authentication status:", isAuthenticated);
    safeLog("Token in localStorage:", localStorage.getItem("token"));
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(
        "https://newcrafts.onrender.com/categories/active"
      );
      safeLog("Categories fetched:", response.data);

      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error("Expected array but got:", typeof response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchActiveCoupons = async () => {
    try {
      const response = await axios.get(
        "https://newcrafts.onrender.com/coupons/active"
      );
      safeLog("Active coupons fetched:", response.data);

      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setActiveCoupons(response.data);
      } else {
        console.error("Expected array but got:", typeof response.data);
        setActiveCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching active coupons:", error);
      setActiveCoupons([]);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    setLoading(true);
    try {
      safeLog("Fetching products for category ID:", categoryId);
      const response = await axios.get(
        `https://newcrafts.onrender.com/products/category/${categoryId}`
      );
      safeLog("Products response:", response.data);

      // Ensure we have an array
      const productsArray = Array.isArray(response.data) ? response.data : [];
      setProducts(productsArray);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (!category || !category.id) {
      console.error("Invalid category object:", category);
      return;
    }
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchProductsByCategory(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setProducts([]);
    setCurrentPage(1);
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem("token");
    safeLog("Checking auth - isAuthenticated:", isAuthenticated);
    safeLog("token:", token);

    if (!isAuthenticated || !token) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handlePreOrderClick = (product) => {
    if (!checkAuthentication()) return;
    safeLog("Pre-order clicked for product:", product);
    setSelectedProduct(product);
    setShowVariantModal(true);
  };

  const handleVariantSelect = (variant) => {
    safeLog("Variant selected:", variant);
    setSelectedVariant(variant);
    setShowVariantModal(false);
    setShowPreOrderModal(true);
  };

  const handlePreOrderSuccess = () => {
    setShowPreOrderModal(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    alert(
      "Pre-order placed successfully! You will receive a confirmation email shortly."
    );
  };

  const addToCart = async (productId) => {
    safeLog("Add to cart clicked for product:", productId);
    if (!checkAuthentication()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://newcrafts.onrender.com/cart",
        { product_id: [productId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      safeLog("Cart response:", response.data);
      alert("Product added to cart successfully!");
      fetchCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage = getNestedValue(
          error,
          "response.data.error",
          "Failed to add product to cart"
        );
        alert(errorMessage);
      }
    }
  };

  const addToWishlist = async (productId, variantId = null) => {
    safeLog("Add to wishlist clicked for product:", productId);
    if (!checkAuthentication()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://newcrafts.onrender.com/wishlist",
        { product_id: productId, variant_id: variantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      safeLog("Wishlist response:", response.data);
      alert("Product added to wishlist successfully!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage = getNestedValue(
          error,
          "response.data.error",
          "Failed to add product to wishlist"
        );
        alert(errorMessage);
      }
    }
  };

  const buyNow = async (productId) => {
    safeLog("Buy now clicked for product:", productId);
    if (!checkAuthentication()) return;

    try {
      await addToCart(productId);
      navigate("/cart");
    } catch (error) {
      console.error("Error in buy now:", error);
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token available for fetching cart items");
        return;
      }
      const response = await axios.get(
        "https://newcrafts.onrender.com/viewcart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      safeLog("Cart items fetched:", response.data);
      if (Array.isArray(response.data)) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
      }
    }
  };

  const formatCouponDisplay = (coupon) => {
    try {
      if (!coupon || typeof coupon !== "object") {
        console.error("Invalid coupon object:", coupon);
        return "Invalid coupon";
      }

      const code = safeRender(coupon.code, "NO-CODE");
      const discountValue = safeRender(coupon.discount_value, "0");
      const discountType = safeRender(coupon.discount_type, "percentage");
      const minOrderAmount = coupon.min_order_amount || 0;
      const description = safeRender(coupon.description, "No description");

      const discountText =
        discountType === "percentage"
          ? `${discountValue}% OFF`
          : `₹${discountValue} OFF`;

      const minOrderText =
        minOrderAmount > 0 ? ` on orders above ₹${minOrderAmount}` : "";

      return `🎫 ${code}: ${discountText}${minOrderText} - ${description}`;
    } catch (error) {
      console.error("Error formatting coupon:", error);
      return "Error displaying coupon";
    }
  };

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const paginatedProducts = safeProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(safeProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  if (categoriesLoading) {
    return (
      <div className="categories-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      {/* Coupons Marquee */}
      {Array.isArray(activeCoupons) && activeCoupons.length > 0 && (
        <div className="coupons-marquee-container">
          <div className="marquee-content">
            <div className="marquee-text">
              🎉 Welcome to Nandini Brass & Metal Crafts!
              {activeCoupons.map((coupon, index) => {
                if (!coupon || typeof coupon !== "object") {
                  console.warn("Invalid coupon at index", index, coupon);
                  return null;
                }
                return (
                  <span key={coupon.code || `coupon-${index}`}>
                    {index > 0 ? " | " : " | "}
                    {formatCouponDisplay(coupon)}
                  </span>
                );
              })}
              {" | Don't miss out on these amazing deals! 🎉"}
            </div>
          </div>
        </div>
      )}

      <div className="categories-header">
        <h2>Product Categories</h2>
        <p>
          {selectedCategory
            ? `Browse products in ${safeRender(
                selectedCategory.name,
                "Unknown Category"
              )}`
            : "Select a category to explore our products"}
        </p>
      </div>

      {!selectedCategory && (
        <div className="category-cards">
          {Array.isArray(categories) &&
            categories.map((category) => {
              if (!category || typeof category !== "object") {
                console.warn("Invalid category:", category);
                return null;
              }

              return (
                <div
                  key={category.id || `category-${Math.random()}`}
                  className="category-card"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="category-image">
                    {category.image_path ? (
                      <img
                        src={`https://newcrafts.onrender.com/${category.image_path}`}
                        alt={safeRender(category.name, "Category")}
                      />
                    ) : (
                      <div className="placeholder-category-image">
                        <span>📦</span>
                      </div>
                    )}
                    <div className="category-overlay">
                      <button className="explore-btn">Explore Products</button>
                    </div>
                  </div>
                  <div className="category-info">
                    <h3 className="category-name">
                      {safeRender(category.name, "Unnamed Category")}
                    </h3>
                    <p className="category-description">
                      {safeRender(
                        category.description,
                        "No description available"
                      )}
                    </p>
                    <div className="category-stats">
                      <span className="product-count">
                        {safeRender(category.product_count, 0)}{" "}
                        {category.product_count === 1 ? "product" : "products"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {selectedCategory && (
        <>
          <div className="selected-category-header">
            <button className="back-btn" onClick={handleBackToCategories}>
              ← Back to Categories
            </button>
            <div className="selected-category-info">
              <h3>
                {safeRender(selectedCategory.name, "Unknown Category")} Products
              </h3>
              <span className="product-count">
                {loading
                  ? "Loading..."
                  : `${safeProducts.length} ${
                      safeProducts.length === 1 ? "product" : "products"
                    } available`}
              </span>
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="products-grid-two-column">
                {paginatedProducts.map((product) => {
                  if (!product || typeof product !== "object") {
                    console.warn("Invalid product:", product);
                    return null;
                  }

                  return (
                    <div
                      key={product.id || `product-${Math.random()}`}
                      className="product-card-wide"
                    >
                      <div className="product-image-wide">
                        {product.image_path ? (
                          <img
                            src={`https://newcrafts.onrender.com/${product.image_path}`}
                            alt={safeRender(product.product_name, "Product")}
                          />
                        ) : (
                          <div className="placeholder-product-image">
                            <span>No Image</span>
                          </div>
                        )}
                        <div className="product-overlay">
                          <button className="quick-view-btn">Quick View</button>
                          {selectedCategory.name === "pre-order" && (
                            <div className="customization-badge">
                              <span>🔧 Customizable</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="product-info-wide">
                        <h4 className="product-name">
                          {safeRender(product.product_name, "Unnamed Product")}
                        </h4>
                        <p className="product-description">
                          {safeRender(
                            product.descripition,
                            "No description available"
                          )}
                        </p>
                        <div className="product-details">
                          <span className="product-price">
                            ₹{safeRender(product.product_price, "0")}
                          </span>
                          {selectedCategory.name === "pre-order" && (
                            <span className="product-availability">
                              <span className="availability-badge">
                                Pre-order Available
                              </span>
                              <span className="customization-info">
                                Metal Types Available
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="product-actions">
                          {selectedCategory.name === "pre-order" ? (
                            <>
                              <button
                                className="preorder-btn"
                                onClick={() => handlePreOrderClick(product)}
                              >
                                🔧 Customize & Pre-order
                              </button>
                              <button
                                className="wishlist-btn"
                                onClick={() => addToWishlist(product.id)}
                                title="Add to Wishlist"
                              >
                                ♡
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="add-to-cart-btn"
                                onClick={() => addToCart(product.id)}
                              >
                                Add to Cart
                              </button>
                              <button
                                className="buy-now-btn"
                                onClick={() => buyNow(product.id)}
                              >
                                Buy Now
                              </button>
                              <button
                                className="wishlist-btn"
                                onClick={() => addToWishlist(product.id)}
                                title="Add to Wishlist"
                              >
                                ♡
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    <span>
                      Showing {indexOfFirstProduct + 1}-
                      {Math.min(indexOfLastProduct, safeProducts.length)} of{" "}
                      {safeProducts.length} products
                    </span>
                  </div>
                  <div className="pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn prev"
                    >
                      ← Previous
                    </button>
                    <div className="pagination-numbers">
                      {currentPage > 3 && totalPages > 5 && (
                        <>
                          <button
                            onClick={() => paginate(1)}
                            className="pagination-number"
                          >
                            1
                          </button>
                          <span className="pagination-ellipsis">...</span>
                        </>
                      )}
                      {getPageNumbers().map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`pagination-number ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      {currentPage < totalPages - 2 && totalPages > 5 && (
                        <>
                          <span className="pagination-ellipsis">...</span>
                          <button
                            onClick={() => paginate(totalPages)}
                            className="pagination-number"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn next"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && safeProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No products available</h3>
              <p>No products available in this category at the moment.</p>
            </div>
          )}
        </>
      )}

      {Array.isArray(categories) &&
        categories.length === 0 &&
        !categoriesLoading && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No categories available</h3>
            <p>Categories will appear here once they are created.</p>
          </div>
        )}

      {/* Product Variant Modal */}
      {showVariantModal && selectedProduct && (
        <ProductVariantModal
          product={selectedProduct}
          onClose={() => setShowVariantModal(false)}
          onVariantSelect={handleVariantSelect}
        />
      )}

      {/* Pre-order Modal */}
      {showPreOrderModal && selectedProduct && selectedVariant && (
        <PreOrderModal
          product={selectedProduct}
          variant={selectedVariant}
          onClose={() => setShowPreOrderModal(false)}
          onSuccess={handlePreOrderSuccess}
        />
      )}
    </div>
  );
};

export default Categories;


