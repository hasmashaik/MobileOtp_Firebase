import React from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const Dashboard = ({ user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="card">
        <h2>Welcome to Dashboard!</h2>
        <div className="user-info">
          <p><strong>Phone Number:</strong> {user.phoneNumber}</p>
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
        </div>
        
        <div className="dashboard-content">
          <h3>You're Successfully Logged In! ✅</h3>
          <p>This is a protected page that only authenticated users can see.</p>
          <div className="features">
            <div className="feature-card">Feature 1</div>
            <div className="feature-card">Feature 2</div>
            <div className="feature-card">Feature 3</div>
          </div>
        </div>
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;