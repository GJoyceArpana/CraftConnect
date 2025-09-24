// src/SellerLogin.tsx
import React, { useState, FormEvent } from 'react';

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
      // Sign up flow - call send-otp API first
      try {
        const response = await fetch('http://localhost:5000/send-otp', {
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
        console.error('Error sending OTP:', error);
        alert('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Login flow - check if user exists in localStorage
    try {
      const existingUserRaw = localStorage.getItem('cc_seller');
      if (!existingUserRaw) {
        alert('Account not found. Please sign up first.');
        return;
      }

      const userData = JSON.parse(existingUserRaw);
      // If you store multiple sellers, adapt this check accordingly
      if (userData.phone === phone && userData.password === password) {
        onNavigate('seller-dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Error reading seller from storage', err);
      alert('An error occurred. Please try again.');
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
