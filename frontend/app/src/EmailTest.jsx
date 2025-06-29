import React, { useState } from 'react';
import axios from 'axios';

const EmailTest = () => {
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [loading, setLoading] = useState(false);
const [result, setResult] = useState('');

const testEmail = async () => {
setLoading(true);
setResult('');
try {
const response = await axios.post('http://localhost:10406/test-email', {
to: email,
subject: 'Test Email',
message: message
});
setResult('✅ Email sent successfully!');
} catch (error) {
setResult(`❌ Email failed: ${error.response?.data?.error || error.message}`);
} finally {
setLoading(false);
}
};

return (
<div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
<h3>Email Test</h3>
<div style={{ marginBottom: '15px' }}>
<label>Email:</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="Enter email to test"
style={{ width: '100%', padding: '8px', marginTop: '5px' }}
/>
</div>
<div style={{ marginBottom: '15px' }}>
<label>Message:</label>
<textarea
value={message}
onChange={(e) => setMessage(e.target.value)}
placeholder="Test message"
style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
/>
</div>
<button 
onClick={testEmail} 
disabled={loading}
style={{ 
padding: '10px 20px', 
backgroundColor: '#007bff', 
color: 'white', 
border: 'none', 
borderRadius: '4px',
cursor: loading ? 'not-allowed' : 'pointer'
}}
>
{loading ? 'Sending...' : 'Send Test Email'}
</button>
{result && (
<div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
{result}
</div>
)}
</div>
);
};

export default EmailTest;
