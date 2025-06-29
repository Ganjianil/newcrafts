import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Account from "./Account";
import contact from "./ContactUs"
import "./Header.css";

const Header = ({
  isAuthenticated,
  onLogout,
  cartItems,
  isAdmin,
  onAdminLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAccountVisible, setIsAccountVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [userFullName, setUserFullName] = useState(""); // State for full_name

  const navigate = useNavigate();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch products for search suggestions
  useEffect(() => {
    fetchProducts();
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.trim() !== "" && searchTerm.length > 0) {
      const suggestions = allProducts
        .filter((product) =>
          product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 8); // Show up to 8 suggestions
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, allProducts]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:10406/viewproducts");
      setAllProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return `Good Morning${userFullName ? `, ${userFullName}` : ""}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good Afternoon${userFullName ? `, ${userFullName}` : ""}`;
    } else if (hour >= 17 && hour < 21) {
      return `Good Evening${userFullName ? `, ${userFullName}` : ""}`;
    } else {
      return `Good Night${userFullName ? `, ${userFullName}` : ""}`;
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const toggleAccount = () => {
    setIsAccountVisible(!isAccountVisible);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setIsSearchVisible(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products?search=${encodeURIComponent(product.product_name)}`);
    setSearchTerm("");
    setShowSuggestions(false);
    setIsSearchVisible(false);
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

  const clearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
  };

  // Callback to receive full_name from Account
  const handleUserDataUpdate = (fullName) => {
    setUserFullName(fullName || "");
  };

  return (
    <>
      <header className="header">
        {/* Top Header */}
        <div className="header-top">
          <div className="container">
            {/* Logo and Greeting */}
            <div className="header-left">
              <h1 className="logo" onClick={() => navigate("/")}>
                <span className="logo-text">
                  {isMobile ? "Nandini Crafts" : "Nandini Brass&Metal crafts"}
                </span>
              </h1>
              <span className="greeting">Hello, {getGreeting()}</span>
            </div>

            {/* Desktop Search */}
            {!isMobile && (
              <div className="search-container desktop-search">
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <div className="search-input-wrapper">
                    <svg
                      className="search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      name="search"
                      placeholder="Search for products..."
                      className="search-input"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
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
                  </div>
                  {/* Desktop Search Suggestions */}
                  {showSuggestions && (
                    <div className="search-suggestions desktop-suggestions">
                      {searchSuggestions.map((product) => (
                        <div
                          key={product.id}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <div className="suggestion-image">
                            {product.image_path ? (
                              <img
                                src={`http://localhost:10406/${product.image_path}`}
                                alt={product.product_name}
                              />
                            ) : (
                              <div className="placeholder-suggestion-image">
                                📦
                              </div>
                            )}
                          </div>
                          <div className="suggestion-details">
                            <span className="suggestion-name">
                              {product.product_name}
                            </span>
                            <span className="suggestion-price">
                              ₹{product.product_price}
                            </span>
                          </div>
                        </div>
                      ))}
                      {searchSuggestions.length > 0 && (
                        <div className="suggestion-footer">
                          <button
                            onClick={() =>
                              handleSearchSubmit({ preventDefault: () => {} })
                            }
                            className="view-all-results"
                          >
                            View all results for "{searchTerm}"
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Header Actions */}
            <div className="header-actions">
              {/* Mobile Search Toggle */}
              {isMobile && (
                <button
                  className="action-btn search-toggle"
                  onClick={toggleSearch}
                  title="Search"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
              )}

              {/* User Account */}
              <button
                className="action-btn account-btn"
                onClick={toggleAccount}
                title="Account"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {!isMobile && <span>Account</span>}
              </button>

              {/* Wishlist */}
              <button
                className="action-btn wishlist-btn"
                onClick={() => navigate("/wishlist")}
                title="Wishlist"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {!isMobile && <span>Wishlist</span>}
              </button>

              {/* Shopping Cart */}
              <button
                className="action-btn cart-btn"
                onClick={() => navigate("/cart")}
                title="Cart"
              >
                <div className="cart-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"></path>
                    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"></path>
                    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"></path>
                  </svg>
                  {(cartItems?.length || 0) > 0 && (
                    <span className="cart-count">{cartItems.length}</span>
                  )}
                </div>
                {!isMobile && <span>Cart</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && isSearchVisible && (
          <div className="mobile-search-container">
            <div className="container">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search for products..."
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="close-search"
                    onClick={toggleSearch}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                {/* Mobile Search Suggestions */}
                {showSuggestions && (
                  <div className="search-suggestions mobile-suggestions">
                    {searchSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(product)}
                      >
                        <div className="suggestion-image">
                          {product.image_path ? (
                            <img
                              src={`http://localhost:10406/${product.image_path}`}
                              alt={product.product_name}
                            />
                          ) : (
                            <div className="placeholder-suggestion-image">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="suggestion-details">
                          <span className="suggestion-name">
                            {product.product_name}
                          </span>
                          <span className="suggestion-price">
                            ₹{product.product_price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="header-nav">
          <div className="container">
            <ul className="nav-menu">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/categories");
                  }}
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/products"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/products");
                  }}
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/photogallery"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/photogallery");
                  }}
                >
                  Photos
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/contact");
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Account Modal/Page */}
      <Account
        isVisible={isAccountVisible}
        onClose={() => setIsAccountVisible(false)}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        onUserDataUpdate={handleUserDataUpdate} // Pass callback to Account
      />
    </>
  );
};

export default Header;
