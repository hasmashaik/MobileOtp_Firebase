import React, { useState } from 'react';
import { sendOTP } from '../services/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onOTPSent }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Format phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    setLoading(true);
    try {
      toast.info('Sending OTP... Please wait');
      const confirmationResult = await sendOTP(fullPhoneNumber);
      toast.success('OTP sent successfully! Check your SMS');
      
      // Clear phone input
      setPhoneNumber('');
      
      // Pass data to parent
      onOTPSent(confirmationResult, fullPhoneNumber);
      
    } catch (error) {
      console.error('Error in handleSendOTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="card">
        <h2>📱 Phone Verification</h2>
        
        <form onSubmit={handleSendOTP}>
          <div className="form-group">
            <label htmlFor="countryCode">Country Code</label>
            <select 
              id="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="country-code-select"
              disabled={loading}
            >
              <option value="+91">India (+91)</option>
              <option value="+1">USA (+1)</option>
              <option value="+44">UK (+44)</option>
              <option value="+971">UAE (+971)</option>
              <option value="+65">Singapore (+65)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Mobile Number</label>
            <div className="phone-input-wrapper">
              <span className="country-code-display">{countryCode}</span>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                }}
                placeholder="Enter 10-digit number"
                className="phone-input"
                disabled={loading}
                required
              />
            </div>
            <small className="helper-text">Enter without country code (e.g., 9876543210)</small>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || phoneNumber.length !== 10}
            className={`send-otp-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending OTP...
              </>
            ) : 'Send OTP'}
          </button>
        </form>
        
        <div className="info-box">
          <p>🔒 We use Firebase Authentication</p>
          <p>📨 You'll receive a 6-digit OTP via SMS</p>
          <p>⏱️ OTP expires in 5 minutes</p>
        </div>
        
        {/* reCAPTCHA container - hidden */}
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
};

export default Login;