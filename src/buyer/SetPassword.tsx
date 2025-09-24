// src/BuyerSetPassword.tsx
import React, { useState, FormEvent } from 'react';
import { UserService } from '../firebase/userService';

type TempData = {
  phone?: string;
  isSignUp?: boolean;
  [k: string]: any;
};

type NavigateFn = (path: string, payload?: any) => void;

type BuyerSetPasswordProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
  tempData?: TempData;
};

const BuyerSetPassword: React.FC<BuyerSetPasswordProps> = ({ onNavigate, onBack, tempData = {} }) => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Save password to Firebase
      if (tempData.phone) {
        await UserService.setUserPassword(tempData.phone, password, 'buyer');
        // Proceed to profile setup
        onNavigate('buyer-setup', { ...tempData, password });
      } else {
        alert('Error: Phone number not found. Please start over.');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      alert('Failed to save password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidLength = password.length >= 6;
  const isMatch = !!password && password === confirmPassword;

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#154731] mb-2">Create Password</h2>
          <p className="text-[#666]">Secure your account with a strong password</p>
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
            disabled={!(isValidLength && isMatch) || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Password'}
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

export default BuyerSetPassword;
