import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Account from "./Account";
import "./MobileFooter.css";
import AdminLogin from "./AdminLogin";

const MobileFooter = ({ isAuthenticated, onLogout, onUserDataUpdate }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [isMobile, setIsMobile] = useState(false);
  const [isAccountVisible, setIsAccountVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update current page based on the current route
  useEffect(() => {
    const path = location.pathname;
    const pageMap = {
      "/": "home",
      "/brands": "brands",
      "/categories": "categories",
      "/admin/login": "luxe",
      "/account": "account",
    };
    const newPage = pageMap[path] || "home";
    setCurrentPage(newPage);
  }, [location.pathname]);

  const handleNavigation = (page, url) => {
    if (page === "account") {
      setIsAccountVisible(true);
    } else {
      navigate(url);
    }
  };

  // Only show on mobile
  if (!isMobile) {
    return null;
  }

  const navigationItems = [
    {
      id: "home",
      label: "HOME",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9,22 9,12 15,12 15,22"></polyline>
        </svg>
      ),
      url: "/",
    },
    {
      id: "brands",
      label: "BRANDS",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      ),
      url: "/brands",
    },
    {
      id: "categories",
      label: "CATEGORIES",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      ),
      url: "/categories",
    },
    {
      id: "luxe",
      label: "LUXE",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"></polygon>
        </svg>
      ),
      url: "/admin/login",
    },
    {
      id: "account",
      label: "ACCOUNT",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      url: "/account",
    },
  ];

  return (
    <>
      <footer className="mobile-footer">
        <div className="mobile-footer-container">
          <nav className="mobile-nav">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-item ${
                  currentPage === item.id ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.id, item.url)}
              >
                <div className="mobile-nav-icon">{item.icon}</div>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {/* Account Modal */}
      <Account
        isVisible={isAccountVisible}
        onClose={() => setIsAccountVisible(false)}
        isAuthenticated={isAuthenticated}
        onLogout={onLogout}
        onUserDataUpdate={onUserDataUpdate} // Added prop
      />
    </>
  );
};

export default MobileFooter;
