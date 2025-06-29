import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Account.css";

const Account = ({
  isVisible,
  onClose,
  isAuthenticated,
  onLogout,
  onUserDataUpdate,
}) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [addresses, setAddresses] = useState([]);
  const [rewards, setRewards] = useState({ points: 0, level: "Bronze" });
  const [loading, setLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    country: "India",
    is_default: false,
  });
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    full_name: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible && isAuthenticated) {
      fetchUserData();
      fetchAddresses();
      fetchRewards();
    } else if (isVisible && !isAuthenticated) {
      setUser(null);
      setAddresses([]);
      setRewards({ points: 0, level: "Bronze" });
      setProfileData({
        username: "",
        email: "",
        phone: "",
        full_name: "",
      });
      // Only call onUserDataUpdate if it exists
      if (typeof onUserDataUpdate === "function") {
        onUserDataUpdate("");
      }
    }
  }, [isVisible, isAuthenticated, onUserDataUpdate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await axios.get("http://localhost:10406/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setProfileData({
        username: response.data.username || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        full_name: response.data.full_name || "",
      });
      // Only call onUserDataUpdate if it exists
      if (typeof onUserDataUpdate === "function") {
        onUserDataUpdate(response.data.full_name || "");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        "http://localhost:10406/user/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:10406/user/rewards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRewards(response.data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:10406/user/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingProfile(false);
      fetchUserData(); // Refetch to update full_name in Header
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (editingAddress && editingAddress.id) {
        await axios.put(
          `http://localhost:10406/user/addresses/${editingAddress.id}`,
          newAddress,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("http://localhost:10406/user/addresses", newAddress, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setNewAddress({
        name: "",
        phone: "",
        street: "",
        city: "",
        zip: "",
        country: "India",
        is_default: false,
      });
      setEditingAddress(null);
      fetchAddresses();
      alert("Address saved successfully");
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address");
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:10406/user/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
      alert("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
      if (error.response?.status === 401 || error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const editAddress = (address) => {
    setNewAddress(address);
    setEditingAddress(address);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAddresses([]);
    setRewards({ points: 0, level: "Bronze" });
    setProfileData({
      username: "",
      email: "",
      phone: "",
      full_name: "",
    });
    // Only call onUserDataUpdate if it exists
    if (typeof onUserDataUpdate === "function") {
      onUserDataUpdate("");
    }
    onClose();
    if (onLogout) onLogout();
  };

  const handleViewOrders = () => {
    onClose();
    navigate("/orders");
  };

  if (!isVisible) return null;

  return (
    <div className="account-overlay">
      <div className="account-modal">
        <div className="account-header">
          <h2>My Account</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {isAuthenticated ? (
          <div className="account-content">
            <div className="user-info">
              <div className="user-avatar">
                {user?.full_name
                  ? user.full_name.charAt(0).toUpperCase()
                  : user?.username
                  ? user.username.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="user-details">
                <h3>{user?.full_name || user?.username || "User"}</h3>
                <p>{user?.email || "No email provided"}</p>
              </div>
            </div>

            <div className="account-tabs">
              <button
                className={activeTab === "profile" ? "tab active" : "tab"}
                onClick={() => setActiveTab("profile")}
              >
                👤 My Profile
              </button>
              <button
                className={activeTab === "orders" ? "tab active" : "tab"}
                onClick={() => setActiveTab("orders")}
              >
                📦 My Orders
              </button>
              <button
                className={activeTab === "addresses" ? "tab active" : "tab"}
                onClick={() => setActiveTab("addresses")}
              >
                📍 My Addresses
              </button>
              <button
                className={activeTab === "rewards" ? "tab active" : "tab"}
                onClick={() => setActiveTab("rewards")}
              >
                🎁 My Rewards
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "profile" && (
                <div className="profile-section">
                  <div className="section-header">
                    <h4>Profile Information</h4>
                    <button
                      className="edit-btn"
                      onClick={() => setEditingProfile(!editingProfile)}
                    >
                      {editingProfile ? "Cancel" : "Edit"}
                    </button>
                  </div>

                  {editingProfile ? (
                    <div className="profile-form">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              full_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <button
                        className="save-btn"
                        onClick={updateProfile}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  ) : (
                    <div className="profile-display">
                      <div className="profile-item">
                        <label>Full Name:</label>
                        <span>{user?.full_name || "Not provided"}</span>
                      </div>
                      <div className="profile-item">
                        <label>Username:</label>
                        <span>{user?.username}</span>
                      </div>
                      <div className="profile-item">
                        <label>Email:</label>
                        <span>{user?.email || "Not provided"}</span>
                      </div>
                      <div className="profile-item">
                        <label>Phone:</label>
                        <span>{user?.phone || "Not provided"}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div className="orders-section">
                  <h4>Recent Orders</h4>
                  <p>View all your orders in the Orders page</p>
                  <button
                    className="view-orders-btn"
                    onClick={handleViewOrders}
                  >
                    View All Orders
                  </button>
                </div>
              )}

              {activeTab === "addresses" && (
                <div className="addresses-section">
                  <div className="section-header">
                    <h4>Saved Addresses</h4>
                    <button
                      className="add-btn"
                      onClick={() => {
                        setNewAddress({
                          name: "",
                          phone: "",
                          street: "",
                          city: "",
                          zip: "",
                          country: "India",
                          is_default: false,
                        });
                        setEditingAddress({});
                      }}
                    >
                      + Add New Address
                    </button>
                  </div>

                  {editingAddress && (
                    <div className="address-form">
                      <h5>
                        {editingAddress.id ? "Edit Address" : "Add New Address"}
                      </h5>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone</label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Street Address</label>
                        <input
                          type="text"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              street: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>ZIP Code</label>
                          <input
                            type="text"
                            value={newAddress.zip}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                zip: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          value={newAddress.country}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              country: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={newAddress.is_default}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                is_default: e.target.checked,
                              })
                            }
                          />
                          Set as default address
                        </label>
                      </div>
                      <div className="form-actions">
                        <button onClick={saveAddress} disabled={loading}>
                          {loading ? "Saving..." : "Save Address"}
                        </button>
                        <button onClick={() => setEditingAddress(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="addresses-list">
                    {addresses.map((address) => (
                      <div key={address.id} className="address-card">
                        <div className="address-info">
                          <h5>
                            {address.name}{" "}
                            {address.is_default && (
                              <span className="default-badge">Default</span>
                            )}
                          </h5>
                          <p>{address.phone}</p>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.zip}
                          </p>
                          <p>{address.country}</p>
                        </div>
                        <div className="address-actions">
                          <button onClick={() => editAddress(address)}>
                            Edit
                          </button>
                          <button onClick={() => deleteAddress(address.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "rewards" && (
                <div className="rewards-section">
                  <h4>My Rewards</h4>
                  <div className="rewards-card">
                    <div className="rewards-points">
                      <h3>{rewards.points}</h3>
                      <p>Reward Points</p>
                    </div>
                    <div className="rewards-level">
                      <h4>{rewards.level} Member</h4>
                      <p>Keep shopping to earn more points!</p>
                    </div>
                  </div>
                  <div className="rewards-info">
                    <h5>How to earn points:</h5>
                    <ul>
                      <li>₹1 spent = 1 point</li>
                      <li>Complete profile = 100 points</li>
                      <li>First order = 200 points</li>
                      <li>Product review = 50 points</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="account-footer">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="login-prompt">
            <h3>Please log in to access your account</h3>
            <div className="login-actions">
              <button
                onClick={() => {
                  onClose();
                  navigate("/login");
                }}
                className="login-btn"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate("/signup");
                }}
                className="signup-btn"
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
