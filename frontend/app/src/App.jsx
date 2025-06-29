import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Banner from "./Banner";
import AllProducts from "./AllProducts";
import Location from "./Location";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import Login from "./Login";
import Signup from "./Signup";
import Cart from "./Cart";
import Wishlist from "./Wishlist";
import Orders from "./Orders";
import Photos from "./Photos";
import Videos from "./Videos";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Categories from "./Categories";
import PhotoGallery from "./PhotoGallery";
import MobileFooter from "./MobileFooter";
import Account from "./Account";
import ForgotPassword from "./ForgotPassword";
import axios from "axios";
import "./App.css";
import ItemCatalog from "./ItemCatalog";
import AdminOrderManager from "./AdminOrderManager";

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminAuth = localStorage.getItem("adminAuth");
        const storedUser = localStorage.getItem("user");

        if (token) {
          try {
            await axios.get("https://newcrafts.onrender.com/user/profile", {
              headers: { Authorization: `Bearer ${token}` },
            });
            setIsAuthenticated(true);
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
              } catch (parseError) {
                localStorage.removeItem("user");
              }
            }
            fetchCartItems(token);
          } catch (tokenError) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
          }
        }

        if (adminAuth === "true") {
          setIsAdminAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchCartItems = async (token) => {
    try {
      const response = await axios.get(
        "https://newcrafts.onrender.com/viewcart",
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
        }
      );
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const handleLogin = (token, userData) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
      fetchCartItems(token);
    } catch (error) {
      console.error("Error in handleLogin:", error);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      setCartItems([]);
    } catch (error) {
      console.error("Error in handleLogout:", error);
    }
  };

  const handleAdminLogin = () => {
    localStorage.setItem("adminAuth", "true");
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("adminAuth");
    setIsAdminAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="App">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ marginTop: "20px", color: "#666" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          cartItems={cartItems}
          isAdmin={isAdminAuthenticated}
          onAdminLogout={handleAdminLogout}
        />

        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <>
                <Banner />
                <Categories
                  isAuthenticated={isAuthenticated}
                  setCartItems={setCartItems}
                />
                <PhotoGallery />
                <Location />
                <AboutUs />
                <ContactUs />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Categories Page */}
          <Route
            path="/categories"
            element={
              <>
                <Categories
                  isAuthenticated={isAuthenticated}
                  setCartItems={setCartItems}
                />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          <Route path="/contact" element={<ContactUs />} />

          {/* Products Page */}
          <Route
            path="/products"
            element={
              <>
                <AllProducts
                  isAuthenticated={isAuthenticated}
                  setCartItems={setCartItems}
                />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Item Catalog - New Flipkart Style */}
          <Route path="/itemcatalog" element={<ItemCatalog />} />

          {/* Login Page */}
          <Route
            path="/login"
            element={
              <>
                <Login onLogin={handleLogin} />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Signup Page */}
          <Route
            path="/signup"
            element={
              <>
                <Signup />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Cart Page */}
          <Route
            path="/cart"
            element={
              <>
                <Cart
                  isAuthenticated={isAuthenticated}
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Wishlist Page */}
          <Route
            path="/wishlist"
            element={
              <>
                <Wishlist
                  isAuthenticated={isAuthenticated}
                  setCartItems={setCartItems}
                />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Orders Page */}
          <Route
            path="/orders"
            element={
              <>
                <Orders isAuthenticated={isAuthenticated} />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Photos Page */}
          <Route
            path="/photos"
            element={
              <>
                <Photos />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          <Route path="/photogallery" element={<PhotoGallery />} />

          {/* Videos Page */}
          <Route
            path="/videos"
            element={
              <>
                <Videos />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />

          {/* Admin Login Page */}
          <Route
            path="/admin/login"
            element={<AdminLogin onAdminLogin={handleAdminLogin} />}
          />

          {/* Admin Dashboard Page */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminDashboard
                isAdminAuthenticated={isAdminAuthenticated}
                onAdminLogout={handleAdminLogout}
              />
            }
          />

          <Route path="/adminordermanager" element={<AdminOrderManager />} />

          {/* Account Page */}
          <Route
            path="/account"
            element={
              <>
                <Account
                  isVisible={true}
                  onClose={() => {}}
                  onLogin={handleLogin}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
                <MobileFooter
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
