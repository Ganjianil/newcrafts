import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
      console.log("Attempting signup with:", {
        username: formData.username,
        email: formData.email,
      });

      const response = await axios.post("http://localhost:10406/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup response:", response.data);

      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setError("User with this username or email already exists");
      } else if (error.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Signup failed. Please try again.");
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
            <p className="brand-tagline">Join our shopping community</p>
          </div>

          <div className="auth-body">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">
              Sign up to start your shopping journey
            </p>

            {error && (
              <div className="error-alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Username</label>
                <div className="input-container">
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength="3"
                    disabled={loading}
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <div className="input-container">
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <span className="input-icon">📧</span>
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
                    minLength="6"
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

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <span className="input-icon">🔒</span>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-button">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account?</p>
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
