// src/SellerLogin.tsx
import React, { useState, FormEvent } from 'react';
import { UserService } from '../firebase/userService';

type NavigateFn = (path: string, payload?: any) => void;

type SellerLoginProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
};

const SellerLogin: React.FC<SellerLoginProps> = ({ onNavigate, onBack }) => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      // Sign up flow - check if user already exists, then send OTP
      try {
        const userExists = await UserService.userExists(phone, 'seller');
        if (userExists) {
          alert('Account already exists with this phone number. Please login instead.');
          setIsLoading(false);
          return;
        }

        // Create initial seller record
        await UserService.createSeller({ phone, isComplete: false });

        // Send OTP
        const response = await fetch('http://127.0.0.1:5000/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        const data = await response.json();

        if (data.success) {
          // OTP sent successfully, navigate to OTP screen
          onNavigate('seller-otp', { phone, isSignUp: true });
        } else {
          alert(data.error || 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error in signup:', error);
        alert('Error creating account. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Login flow - verify with Firebase
    try {
      const user = await UserService.verifyLogin(phone, password, 'seller');
      if (user) {
        if (user.isComplete) {
          // User profile is complete, go to dashboard
          onNavigate('seller-dashboard');
        } else {
          // User exists but profile incomplete, go to setup
          onNavigate('seller-setup', { phone });
        }
      } else {
        alert('Invalid phone number or password. Please try again.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#d67a4a] mb-2">
            {isSignUp ? 'Join as Seller' : 'Seller Login'}
          </h2>
          <p className="text-[#666]">
            {isSignUp ? 'Start selling your crafts' : 'Welcome back to CraftConnect'}
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

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Please wait...' : (isSignUp ? 'Send OTP' : 'Login')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#d67a4a] font-medium hover:underline"
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

export default SellerLogin;
