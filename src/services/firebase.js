import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB736JMQnQZV4OZ3dYwVqD7bEW-csDzoT4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mobileotp-33c53.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mobileotp-33c53",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mobileotp-33c53.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1086742492224",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1086742492224:web:aee65ed966f30065475ba5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Global variable to store recaptcha verifier
let recaptchaVerifier = null;

// Setup reCAPTCHA - FIXED VERSION
export const setupRecaptcha = () => {
  try {
    // Check if element exists
    let recaptchaContainer = document.getElementById("recaptcha-container");
    
    if (!recaptchaContainer) {
      recaptchaContainer = document.createElement("div");
      recaptchaContainer.id = "recaptcha-container";
      document.body.appendChild(recaptchaContainer);
    }
    
    // Clear previous recaptcha if exists
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (error) {
        console.log("Clearing old recaptcha failed, continuing...");
      }
    }
    
    // Create new recaptcha verifier
    recaptchaVerifier = new RecaptchaVerifier(
      recaptchaContainer, 
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved successfully");
        },
        "expired-callback": () => {
          console.log("reCAPTCHA expired, resetting...");
          resetRecaptcha();
        }
      }, 
      auth
    );
    
    console.log("reCAPTCHA initialized successfully");
    return recaptchaVerifier;
    
  } catch (error) {
    console.error("Error setting up reCAPTCHA:", error);
    throw new Error("Failed to initialize security verification. Please refresh the page.");
  }
};

// Reset reCAPTCHA
const resetRecaptcha = () => {
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  } catch (error) {
    console.error("Error resetting reCAPTCHA:", error);
  }
};

// Send OTP - FIXED VERSION
export const sendOTP = async (phoneNumber) => {
  try {
    console.log("Preparing to send OTP to:", phoneNumber);
    
    // Ensure recaptcha is initialized
    let verifier = recaptchaVerifier;
    if (!verifier) {
      verifier = setupRecaptcha();
    }
    
    // Verify phone number format
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    console.log("Formatted phone number:", formattedPhoneNumber);
    
    // Render recaptcha
    try {
      const recaptchaWidgetId = await verifier.render();
      console.log("reCAPTCHA rendered with ID:", recaptchaWidgetId);
    } catch (renderError) {
      console.log("reCAPTCHA already rendered, continuing...");
    }
    
    // Send OTP
    console.log("Sending OTP...");
    const confirmationResult = await signInWithPhoneNumber(
      auth, 
      formattedPhoneNumber, 
      verifier
    );
    
    console.log("OTP sent successfully!");
    return confirmationResult;
    
  } catch (error) {
    console.error("Error in sendOTP:", error.code, error.message);
    
    // Reset recaptcha on error
    resetRecaptcha();
    
    // User-friendly error messages
    let errorMessage = "Failed to send OTP. Please try again.";
    
    switch (error.code) {
      case "auth/invalid-phone-number":
        errorMessage = "Invalid phone number format. Please use format: +91XXXXXXXXXX";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts. Please try again in a few minutes.";
        break;
      case "auth/quota-exceeded":
        errorMessage = "Daily SMS limit exceeded. Please try again tomorrow.";
        break;
      case "auth/captcha-check-failed":
        errorMessage = "Security check failed. Please refresh the page and try again.";
        break;
      case "auth/app-not-authorized":
        errorMessage = "App not authorized. Check Firebase Console configuration.";
        break;
      case "auth/internal-error":
        errorMessage = "Internal server error. Please check your Firebase setup.";
        break;
    }
    
    throw new Error(errorMessage);
  }
};

// Verify OTP
export const verifyOTP = async (confirmationResult, otp) => {
  try {
    console.log("Verifying OTP...");
    
    const result = await confirmationResult.confirm(otp);
    console.log("OTP verified successfully!");
    
    // Cleanup recaptcha after successful verification
    resetRecaptcha();
    
    return result.user;
    
  } catch (error) {
    console.error("Error verifying OTP:", error.code, error.message);
    
    let errorMessage = "Invalid OTP. Please try again.";
    
    switch (error.code) {
      case "auth/invalid-verification-code":
        errorMessage = "Invalid OTP code. Please enter the correct 6-digit code.";
        break;
      case "auth/code-expired":
        errorMessage = "OTP has expired. Please request a new OTP.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled.";
        break;
    }
    
    throw new Error(errorMessage);
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
    resetRecaptcha();
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

// Check authentication state
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

export default app;