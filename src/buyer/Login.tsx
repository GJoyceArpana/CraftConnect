// src/BuyerLogin.tsx
import React, { useState, FormEvent } from 'react';
import { firestoreService, UserData } from '../services/firestoreService';
import { twilioService } from '../services/twilioService';

type NavigateFn = (path: string, payload?: any) => void;

type BuyerLoginProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
};

const BuyerLogin: React.FC<BuyerLoginProps> = ({ onNavigate, onBack }) => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = twilioService.formatPhoneNumber(phone);

      if (isSignUp) {
        // Sign up flow - check if user already exists
        const existingUser = await firestoreService.getUserByPhone(formattedPhone);
        if (existingUser) {
          alert('Account already exists with this phone number. Please login instead.');
          setIsLoading(false);
          return;
        }

        // Send OTP for signup
        const otpSent = await twilioService.sendOTP(formattedPhone);
        if (otpSent) {
          onNavigate('buyer-otp', { phone: formattedPhone, isSignUp: true });
        } else {
          alert('Failed to send OTP. Please try again.');
        }
      } else {
        // Login flow - First try demo users, then Firebase
        const demoUsers = [
          { phone: '+919876543210', password: 'demo123', name: 'Demo Buyer', email: 'demo@buyer.com', isComplete: true },
          { phone: '+919999999999', password: 'test123', name: 'Test User', email: 'test@buyer.com', isComplete: true },
          { phone: '9876543210', password: 'demo123', name: 'Demo Buyer', email: 'demo@buyer.com', isComplete: true },
          { phone: '9999999999', password: 'test123', name: 'Test User', email: 'test@buyer.com', isComplete: true }
        ];
        
        // Check demo users first
        const demoUser = demoUsers.find(user => 
          (user.phone === formattedPhone || user.phone === phone) && user.password === password
        );
        
        if (demoUser) {
          // Store demo user session
          localStorage.setItem('cc_buyer', JSON.stringify({ ...demoUser, type: 'buyer' }));
          onNavigate('buyer-dashboard');
          setIsLoading(false);
          return;
        }
        
        try {
          // Try Firebase authentication
          const existingUser = await firestoreService.getUserByPhone(formattedPhone);
          if (!existingUser) {
            alert('Account not found. Use demo credentials: Phone: 9876543210, Password: demo123');
            setIsLoading(false);
            return;
          }

          // For demo purposes, we'll use password-based login
          if (existingUser.password === password) {
            // Store user session
            localStorage.setItem('cc_buyer', JSON.stringify({ ...existingUser, type: 'buyer' }));
            onNavigate('buyer-dashboard');
          } else {
            alert('Invalid credentials. Try demo: Phone: 9876543210, Password: demo123');
          }
        } catch (firebaseError) {
          console.log('Firebase not available, using demo mode');
          alert('Use demo credentials: Phone: 9876543210, Password: demo123');
        }
      }
    } catch (err) {
      console.error('Error during authentication:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#154731] mb-2">
            {isSignUp ? 'Join as Buyer' : 'Buyer Login'}
          </h2>
          <p className="text-[#666]">
            {isSignUp ? 'Create your buyer account' : 'Welcome back to CraftConnect'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {!isSignUp && (
            <div>
              <label className="block text-sm font-medium text-[#333] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Send OTP' : 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#154731] font-medium hover:underline"
            type="button"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-[#666] hover:text-[#333] font-medium"
            type="button"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;
