// src/BuyerLogin.tsx
import React, { useState, FormEvent } from 'react';

type NavigateFn = (path: string, payload?: any) => void;

type BuyerLoginProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
};

const BuyerLogin: React.FC<BuyerLoginProps> = ({ onNavigate, onBack }) => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      // Sign up flow - go to OTP screen and pass phone/isSignUp flag.
      // The route handler (buyer-otp) can read the payload and show OTP UI.
      onNavigate('buyer-otp', { phone, isSignUp: true });
      return;
    }

    // Login flow - check if user exists in localStorage (demo)
    try {
      const existingUserRaw = localStorage.getItem('cc_buyer');
      if (!existingUserRaw) {
        alert('Account not found. Please sign up first.');
        return;
      }

      const userData = JSON.parse(existingUserRaw);
      // If you store multiple buyers, this simple demo assumes single buyer object.
      // If you store an array, adapt this check accordingly.
      if (userData.phone === phone && userData.password === password) {
        // If you want to persist "logged in" state, you can set localStorage or app state here.
        onNavigate('buyer-dashboard');
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error('Error reading user from storage', err);
      alert('An error occurred. Please try again.');
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

          <button type="submit" className="btn-primary w-full">
            {isSignUp ? 'Send OTP' : 'Login'}
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
