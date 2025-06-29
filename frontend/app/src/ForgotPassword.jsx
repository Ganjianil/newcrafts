import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const ForgotPassword = () => {
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState('');
const [error, setError] = useState('');

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError('');
setMessage('');

try {
await axios.post("https://newcrafts.onrender.com/forgot-password", { email });
setMessage('Password reset email sent! Please check your inbox.');
} catch (error) {
console.error('Forgot password error:', error);
const errorMessage = error.response?.data || 'Failed to send reset email. Please try again.';
setError(errorMessage);
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
<p className="brand-tagline">Reset your password</p>
</div>

<div className="auth-body">
<h2 className="auth-title">Forgot Password</h2>
<p className="auth-subtitle">Enter your email to receive a password reset link</p>

{error && (
<div className="error-alert">
<span className="error-icon">⚠️</span>
<span>{error}</span>
</div>
)}

{message && (
<div className="success-alert">
<span className="success-icon">✅</span>
<span>{message}</span>
</div>
)}

<form onSubmit={handleSubmit} className="auth-form">
<div className="input-group">
<label>Email Address</label>
<div className="input-container">
<input
type="email"
name="email"
placeholder="Enter your email address"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
<span className="input-icon">📧</span>
</div>
</div>

<button
type="submit"
disabled={loading}
className="auth-button"
>
{loading ? (
<>
<span className="spinner"></span>
Sending Reset Link...
</>
) : (
"Send Reset Link"
)}
</button>
</form>

<div className="auth-footer">
<p>Remember your password?</p>
<Link to="/login" className="auth-link">
Back to Sign In
</Link>
</div>
</div>
</div>
</div>
</div>
);
};

export default ForgotPassword;
