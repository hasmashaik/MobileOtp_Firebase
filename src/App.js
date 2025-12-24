// import logo from './logo.svg';
// import './App.css';
// import Auth from './components/Auth';

// function App() {
//   return (
//     <div className="App">
//       <Auth/>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import OTPVerification from './components/OTPVerification';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('login');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setStep('dashboard');
      } else {
        setUser(null);
        setStep('login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOTPSent = (result, phone) => {
    setConfirmationResult(result);
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPVerified = (user) => {
    setUser(user);
    setStep('dashboard');
  };

  const handleBack = () => {
    setStep('login');
    setConfirmationResult(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Firebase Phone Auth</h1>
      </header>
      
      <main className="main-content">
        {step === 'login' && <Login onOTPSent={handleOTPSent} />}
        {step === 'otp' && (
          <OTPVerification
            confirmationResult={confirmationResult}
            phoneNumber={phoneNumber}
            onVerified={handleOTPVerified}
            onBack={handleBack}
          />
        )}
        {step === 'dashboard' && user && <Dashboard user={user} />}
      </main>
      
      <footer className="App-footer">
        <p>Built with React.js & Firebase Authentication</p>
      </footer>
    </div>
  );
}

export default App;