import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OtpForm.css';

const OtpForm = () => {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('otpToken');
    if (!token) {
      navigate('/'); // Redirect to email form if no token
      return;
    }

    try {
      // Decode token to get email
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const { email } = JSON.parse(jsonPayload);
      setEmail(email);
    } catch (error) {
      console.error('Error decoding token:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Verifying OTP...');
    setIsError(false);
    
    const token = localStorage.getItem('otpToken');
    if (!token) {
      setStatus('Session expired. Please try again.');
      setIsError(true);
      navigate('/');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('OTP verified successfully!');
        setIsError(false);
        // Store the new verified token
        localStorage.setItem('authToken', data.token);
        // Remove the OTP token
        localStorage.removeItem('otpToken');
        // Redirect to home page
        navigate('/home');
      } else {
        setStatus(data.error || 'Invalid OTP. Please try again.');
        setIsError(true);
        if (data.error === 'Invalid or expired token') {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error verifying OTP. Please try again.');
      setIsError(true);
    }
  };

  return (
    <div className="otp-form-container">
      <h2>Enter OTP</h2>
      <p className="email-info">OTP sent to: {email}</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Enter OTP:</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter the OTP sent to your email"
            maxLength="6"
            pattern="[0-9]{6}"
          />
        </div>
        <button type="submit" className="submit-button">
          Verify OTP
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

export default OtpForm; 