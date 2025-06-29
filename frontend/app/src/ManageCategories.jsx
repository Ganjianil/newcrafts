import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageCategories.css";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:10406/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    clearMessages();
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    clearMessages();
  };

  const clearMessages = () => {
    if (message) setMessage("");
    if (error) setError("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      is_active: true,
    });
    setImage(null);
    setEditingCategory(null);
    setShowForm(false);
    clearMessages();

    // Reset file input
    const fileInput = document.getElementById("category-image");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    setSubmitting(true);
    clearMessages();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description);
      formDataToSend.append("is_active", formData.is_active);

      if (image) {
        formDataToSend.append("image", image);
      }

      if (editingCategory) {
        await axios.put(
          `http://localhost:10406/admin/categories/${editingCategory.id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setMessage("Category updated successfully!");
      } else {
        await axios.post(
          "http://localhost:10406/admin/categories",
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setMessage("Category created successfully!");
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      setError(error.response?.data?.error || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      is_active: category.is_active,
    });
    setShowForm(true);
    clearMessages();
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:10406/admin/categories/${categoryId}`
      );
      setMessage("Category deleted successfully!");
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error.response?.data?.error || "Failed to delete category");
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const formData = new FormData();
      const category = categories.find((c) => c.id === categoryId);
      formData.append("name", category.name);
      formData.append("description", category.description || "");
      formData.append("is_active", !currentStatus);

      await axios.put(
        `http://localhost:10406/admin/categories/${categoryId}`,
        formData
      );

      setMessage(
        `Category ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category status:", error);
      setError("Failed to update category status");
    }
  };

  if (loading) {
    return (
      <div className="manage-categories-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-categories-container">
      <div className="manage-categories-header">
        <h2>Manage Categories</h2>
        <button
          onClick={() => setShowForm(true)}
          className="add-category-btn"
          disabled={showForm}
        >
          + Add New Category
        </button>
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

      {showForm && (
        <div className="category-form-container">
          <div className="category-form-header">
            <h3>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
            <button onClick={resetForm} className="close-form-btn">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter category name"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter category description"
                rows="3"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category-image">Category Image</label>
              <input
                type="file"
                id="category-image"
                onChange={handleImageChange}
                accept="image/*"
                disabled={submitting}
              />
              <small className="form-help">
                Upload an image to represent this category
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
                <span className="checkbox-text">Active Category</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="submit-btn"
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    {editingCategory ? "Updating..." : "Creating..."}
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-image">
                {category.image_path ? (
                  <img
                    src={`http://localhost:10406/${category.image_path}`}
                    alt={category.name}
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>No Image</span>
                  </div>
                )}
                <div
                  className={`status-badge ${
                    category.is_active ? "active" : "inactive"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">
                  {category.description || "No description available"}
                </p>
                <div className="category-stats">
                  <span className="product-count">
                    {category.product_count}{" "}
                    {category.product_count === 1 ? "product" : "products"}
                  </span>
                  <span className="created-date">
                    Created:{" "}
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="category-actions">
                <button
                  onClick={() => handleEdit(category)}
                  className="edit-btn"
                  title="Edit Category"
                >
                  ✏️
                </button>
                <button
                  onClick={() =>
                    toggleCategoryStatus(category.id, category.is_active)
                  }
                  className={`toggle-btn ${
                    category.is_active ? "deactivate" : "activate"
                  }`}
                  title={category.is_active ? "Deactivate" : "Activate"}
                >
                  {category.is_active ? "🔒" : "🔓"}
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="delete-btn"
                  title="Delete Category"
                  disabled={category.product_count > 0}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No categories found</h3>
            <p>Create your first category to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
