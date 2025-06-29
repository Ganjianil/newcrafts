import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Wishlist.css";

const Wishlist = ({ isAuthenticated, setCartItems }) => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [clearingWishlist, setClearingWishlist] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistItems();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Fetching wishlist items...");
      const response = await axios.get(
        "https://newcrafts.onrender.com//wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Wishlist response:", response.data);

      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setWishlistItems(response.data);
      } else {
        console.error("Expected array but got:", typeof response.data);
        setWishlistItems([]);
        setError("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching wishlist items:", error);

      // Handle different error types
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to load wishlist. Please try again.");
      }

      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove individual item from wishlist
  const removeFromWishlist = async (itemId) => {
    if (!itemId) {
      alert("Invalid item ID");
      return;
    }

    setRemovingItems((prev) => new Set(prev).add(itemId));

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Removing wishlist item:", itemId);
      await axios.delete(`http://localhost:10406/wishlist/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state
      setWishlistItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      alert("Item removed from wishlist successfully!");
    } catch (error) {
      console.error("Error removing item from wishlist:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage =
          error.response?.data?.error || "Failed to remove item from wishlist";
        alert(errorMessage);
      }
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (
      !window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      return;
    }

    setClearingWishlist(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Clearing entire wishlist...");
      await axios.delete("http://localhost:10406/wishlist/clear", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlistItems([]);
      alert("Wishlist cleared successfully!");
    } catch (error) {
      console.error("Error clearing wishlist:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage =
          error.response?.data?.error || "Failed to clear wishlist";
        alert(errorMessage);
      }
    } finally {
      setClearingWishlist(false);
    }
  };

  // Add to cart from wishlist
  const addToCart = async (productId) => {
    if (!productId) {
      alert("Invalid product ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      console.log("Adding to cart from wishlist:", productId);
      await axios.post(
        "http://localhost:10406/cart",
        { product_id: [productId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Product added to cart successfully!");
      fetchCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMessage =
          error.response?.data?.error || "Failed to add product to cart";
        alert(errorMessage);
      }
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const response = await axios.get("http://localhost:10406/viewcart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setCartItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // Don't redirect on cart fetch error, just log it
    }
  };

  // Calculate variant price if applicable
  const getItemPrice = (item) => {
    if (item.variant_id && item.price_multiplier && item.additional_price) {
      const basePrice = parseFloat(item.product_price || 0);
      const multiplier = parseFloat(item.price_multiplier || 1);
      const additional = parseFloat(item.additional_price || 0);
      return (basePrice * multiplier + additional).toFixed(2);
    }
    return parseFloat(item.product_price || 0).toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="wishlist-container">
        <div className="auth-message">
          <h2>Please login to view your wishlist</h2>
          <button onClick={() => navigate("/login")} className="login-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-container">
        <div className="error-message">
          <h2>Error Loading Wishlist</h2>
          <p>{error}</p>
          <button onClick={fetchWishlistItems} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2>My Wishlist ({wishlistItems.length} items)</h2>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            disabled={clearingWishlist}
            className="clear-all-btn"
          >
            {clearingWishlist ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-icon">💝</div>
          <h3>Your wishlist is empty</h3>
          <p>Add some products to your wishlist to see them here!</p>
          <button
            onClick={() => navigate("/categories")}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map((item) => {
            if (!item || !item.id) {
              console.warn("Invalid wishlist item:", item);
              return null;
            }

            return (
              <div key={item.id} className="wishlist-item">
                <div className="item-image">
                  {item.image_path ? (
                    <img
                      src={`http://localhost:10406/${item.image_path}`}
                      alt={item.product_name || "Product"}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="placeholder-image"
                    style={{ display: item.image_path ? "none" : "flex" }}
                  >
                    <span>No Image</span>
                  </div>
                </div>

                <div className="item-details">
                  <h3>{item.product_name || "Unnamed Product"}</h3>
                  <p className="item-description">
                    {item.descripition || "No description available"}
                  </p>

                  {item.variant_name && (
                    <p className="item-variant">
                      <strong>Variant:</strong> {item.variant_name}
                      {item.variant_description && (
                        <span className="variant-desc">
                          {" "}
                          - {item.variant_description}
                        </span>
                      )}
                    </p>
                  )}

                  <p className="item-price">₹{getItemPrice(item)}</p>
                </div>

                <div className="item-actions">
                  <button
                    onClick={() => addToCart(item.product_id)}
                    className="add-to-cart-btn"
                    disabled={!item.product_id}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    disabled={removingItems.has(item.id)}
                    className="remove-item-btn"
                  >
                    {removingItems.has(item.id) ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
