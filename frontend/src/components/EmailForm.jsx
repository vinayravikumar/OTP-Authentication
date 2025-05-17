import { useState } from 'react';
import './EmailForm.css';

const EmailForm = ({ onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending OTP...');
    setIsError(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('OTP sent successfully! Check your email.');
        setIsError(false);
        // Store the JWT token in localStorage
        localStorage.setItem('otpToken', data.token);
        // Show OTP form
        onEmailSubmit();
      } else {
        setStatus(data.error || 'Failed to send OTP. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error sending OTP. Please try again.');
      setIsError(true);
    }
  };

  return (
    <div className="email-form-container">
      <h2>Enter Your Email</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <button type="submit" className="submit-button">
          Send OTP
        </button>
        {status && (
          <p className={`status-message ${isError ? 'error' : 'success'}`}>
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

export default EmailForm; 