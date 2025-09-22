import React, { useState } from 'react';

const BuyerSetPassword = ({ onNavigate, onBack, tempData }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    onNavigate('buyer-setup', { ...tempData, password });
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#154731] mb-2">
            Create Password
          </h2>
          <p className="text-[#666]">
            Secure your account with a strong password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">
              New Password
            </label>
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
            <label className="block text-sm font-medium text-[#333] mb-2">
              Confirm Password
            </label>
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
              <li className={password.length >= 6 ? 'text-green-600' : ''}>
                At least 6 characters
              </li>
              <li className={password === confirmPassword && password ? 'text-green-600' : ''}>
                Passwords match
              </li>
            </ul>
          </div>

          <button type="submit" className="btn-primary w-full">
            Create Password
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-[#666] hover:text-[#333] font-medium"
          >
            ← Back to OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerSetPassword;