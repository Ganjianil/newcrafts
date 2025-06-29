import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import AddProduct from "./AddProduct";
import AddPreOrderProduct from "./AddPreOrderProduct";
import ManageProducts from "./ManageProducts";
import ViewOrders from "./ViewOrders";
import ManagePreOrders from "./ManagePreOrders";
import ManageCategories from "./ManageCategories";
import ManageCoupons from "./ManageCoupons";
import Photos from "./Photos";
import "./AdminDashboard.css";

const AdminDashboard = ({ isAdminAuthenticated, onAdminLogout }) => {
  const [activeTab, setActiveTab] = useState("add-product");

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "add-product":
        return <AddProduct />;
      case "add-preorder-product":
        return <AddPreOrderProduct />;
      case "manage-products":
        return <ManageProducts />;
      case "manage-categories":
        return <ManageCategories />;
      case "manage-coupons":
        return <ManageCoupons />;
      case "manage-preorders":
        return <ManagePreOrders />;
      case "view-orders":
        return <ViewOrders />;
      case "photos":
        return <Photos />;
      default:
        return <AddProduct />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onAdminLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <div className="nav-section">
              <h3 className="nav-section-title">Products</h3>
              <button
                className={`nav-btn ${
                  activeTab === "add-product" ? "active" : ""
                }`}
                onClick={() => setActiveTab("add-product")}
              >
                <span className="nav-icon">➕</span>
                Add Product
              </button>
              <button
                className={`nav-btn ${
                  activeTab === "add-preorder-product" ? "active" : ""
                }`}
                onClick={() => setActiveTab("add-preorder-product")}
              >
                <span className="nav-icon">🔧</span>
                Add Pre-order Product
              </button>
              <button
                className={`nav-btn ${
                  activeTab === "manage-products" ? "active" : ""
                }`}
                onClick={() => setActiveTab("manage-products")}
              >
                <span className="nav-icon">📦</span>
                Manage Products
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">Categories & Coupons</h3>
              <button
                className={`nav-btn ${
                  activeTab === "manage-categories" ? "active" : ""
                }`}
                onClick={() => setActiveTab("manage-categories")}
              >
                <span className="nav-icon">📂</span>
                Manage Categories
              </button>
              <button
                className={`nav-btn ${
                  activeTab === "manage-coupons" ? "active" : ""
                }`}
                onClick={() => setActiveTab("manage-coupons")}
              >
                <span className="nav-icon">🎫</span>
                Manage Coupons
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">Orders</h3>
              <button
                className={`nav-btn ${
                  activeTab === "manage-preorders" ? "active" : ""
                }`}
                onClick={() => setActiveTab("manage-preorders")}
              >
                <span className="nav-icon">🔧</span>
                Manage Pre-Orders
              </button>
              <button
                className={`nav-btn ${
                  activeTab === "view-orders" ? "active" : ""
                }`}
                onClick={() => setActiveTab("view-orders")}
              >
                <span className="nav-icon">📋</span>
                View Orders
              </button>
            </div>

            <div className="nav-section">
              <h3 className="nav-section-title">Media</h3>
              <button
                className={`nav-btn ${activeTab === "photos" ? "active" : ""}`}
                onClick={() => setActiveTab("photos")}
              >
                <span className="nav-icon">📸</span>
                Photos
              </button>
            </div>
          </nav>
        </div>

        <div className="admin-main">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
