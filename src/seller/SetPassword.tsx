// src/SellerSetPassword.tsx
import React, { useState, FormEvent } from 'react';

type TempData = {
  phone?: string;
  isSignUp?: boolean;
  [k: string]: any;
};

type NavigateFn = (path: string, payload?: any) => void;

type SellerSetPasswordProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
  tempData?: TempData;
};

const SellerSetPassword: React.FC<SellerSetPasswordProps> = ({ onNavigate, onBack, tempData = {} }) => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Proceed to next step with the tempData payload + password
    onNavigate('seller-setup', { ...tempData, password });
  };

  const isValidLength = password.length >= 6;
  const isMatch = !!password && password === confirmPassword;

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#d67a4a] mb-2">Create Password</h2>
          <p className="text-[#666]">Secure your seller account with a strong password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password (min 6 characters)"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="text-sm text-[#666] space-y-1">
            <p>Password requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li className={isValidLength ? 'text-green-600' : ''}>At least 6 characters</li>
              <li className={isMatch ? 'text-green-600' : ''}>Passwords match</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            aria-disabled={!(isValidLength && isMatch)}
          >
            Create Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-[#666] hover:text-[#333] font-medium" type="button">
            ← Back to OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerSetPassword;
