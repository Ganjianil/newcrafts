import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllProducts.css";

const AllProducts = ({ isAuthenticated, setCartItems }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchQuery = urlParams.get("search");
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(
        (product) =>
          product.product_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.descripition.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, allProducts]);

  useEffect(() => {
    if (searchTerm.trim() !== "" && searchTerm.length > 0) {
      const suggestions = allProducts
        .filter((product) =>
          product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((product) => product.product_name)
        .filter((name, index, self) => self.indexOf(name) === index)
        .slice(0, 5);
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allProducts]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "https://newcrafts.onrender.com/viewproducts"
      );
      console.log("Products:", response.data);
      setAllProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://newcrafts.onrender.com/cart",
        { product_id: [productId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Product added to cart successfully!");
      fetchCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

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
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    navigate("/products");
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() !== "" && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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

  if (loading) {
    return (
      <div className="all-products-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-products-page">
      <div className="container">
        <div className="page-header">
          <h1>All Products</h1>
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="clear-search-btn"
                  >
                    ×
                  </button>
                )}
                <button type="submit" className="search-btn">
                  🔍
                </button>
              </div>
              {showSuggestions && (
                <div className="search-suggestions">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="suggestion-icon">🔍</span>
                      <span className="suggestion-text">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">🔍</div>
            <h3>No products found</h3>
            <p>
              {searchTerm
                ? `No products found for "${searchTerm}". Try adjusting your search terms.`
                : "No products available at the moment."}
            </p>
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search-btn-large">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Products Grid - 2 products per row */}
            <div className="products-grid-two-column">
              {currentProducts.map((product) => (
                <div key={product.id} className="product-card-wide">
                  <div className="product-image-wide">
                    {product.image_path ? (
                      <img
                        src={`https://newcrafts.onrender.com/${product.image_path}`}
                        alt={product.product_name}
                      />
                    ) : (
                      <div className="placeholder-product-image">
                        <span>No Image</span>
                      </div>
                    )}
                    <div className="product-overlay">
                      <button className="quick-view-btn">Quick View</button>
                    </div>
                  </div>
                  <div className="product-info-wide">
                    <h3>{product.product_name}</h3>
                    <p className="product-description">
                      {product.descripition}
                    </p>
                    <p className="product-price">₹{product.product_price}</p>
                    <div className="product-actions">
                      <button
                        onClick={() => addToCart(product.id)}
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                      <button className="wishlist-btn" title="Add to Wishlist">
                        ♡
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>
                    Showing {indexOfFirstProduct + 1}-
                    {Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
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
      </div>
    </div>
  );
};

export default AllProducts;
