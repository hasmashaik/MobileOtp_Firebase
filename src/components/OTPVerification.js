import React, { useState, useRef, useEffect } from 'react';
import { verifyOTP } from '../services/firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OTPVerification = ({ confirmationResult, phoneNumber, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      for (let i = 0; i < 6; i++) {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = newOtp[i] || '';
        }
      }
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      if (inputRefs.current[Math.min(5, pastedData.length - 1)]) {
        inputRefs.current[Math.min(5, pastedData.length - 1)].focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOTP(confirmationResult, otpString);
      toast.success('Login successful!');
      onVerified(user);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    toast.info('Resend OTP functionality would be implemented here');
    // In a real app, you would call sendOTP again
  };

  return (
    <div className="otp-container">
      <ToastContainer />
      <div className="card">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h2>Verify OTP</h2>
        <p className="phone-display">OTP sent to {phoneNumber}</p>
        
        <form onSubmit={handleVerify}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="otp-digit"
              />
            ))}
          </div>
          
          <button 
            type="submit" 
            disabled={loading || otp.join('').length !== 6}
            className="verify-btn"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        
        <div className="resend-section">
          <p>Didn't receive OTP?</p>
          <button onClick={handleResend} className="resend-btn">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;