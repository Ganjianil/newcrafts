import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username or email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
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

    try {
      console.log("Attempting login with:", { username: formData.username });

      const response = await axios.post(
        "https://newcrafts.onrender.com/login",
        {
          username: formData.username,
          password: formData.password,
        }
      );

      console.log("Login response:", response.data);

      if (response.data.token && response.data.user) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Call the onLogin callback with token and user data
        onLogin(response.data.token, response.data.user);

        console.log("Login successful, navigating to home");

        // Navigate to home page
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 401) {
        setError("Invalid username or password");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="brand-logo">Nandini Brass & Metal Crafts</h1>
            <p className="brand-tagline">Welcome back to our store</p>
          </div>

          <div className="auth-body">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">
              Enter your credentials to access your account
            </p>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Username or Email</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username or email"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-icon">🔒</span>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account?</p>
              <Link to="/signup" className="auth-link">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
