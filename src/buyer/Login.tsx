// src/BuyerLogin.tsx
import React, { useState, FormEvent } from 'react';
import { UserService } from '../firebase/mockService';
import { apiService } from '../services/api';

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
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetStep, setResetStep] = useState<'phone' | 'otp' | 'password'>('phone');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      // Sign up flow - check if user already exists, then send OTP
      try {
        const userExists = await UserService.userExists(phone, 'buyer');
        if (userExists) {
          alert('Account already exists with this phone number. Please login instead.');
          setIsLoading(false);
          return;
        }

        console.log('Creating buyer record for phone:', phone);
        
        // Create initial buyer record
        await UserService.createBuyer({ phone, isComplete: false });
        console.log('Buyer record created successfully');

        // Send OTP
        console.log('Sending OTP to:', phone);
        const response = await fetch('http://localhost:5000/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone }),
        });

        const data = await response.json();
        console.log('OTP response:', data);

        if (data.success) {
          // OTP sent successfully, navigate to OTP screen
          console.log('OTP sent successfully, navigating to OTP screen');
          onNavigate('buyer-otp', { phone, isSignUp: true });
        } else {
          alert(data.error || 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error in signup:', error);
        console.error('Error details:', error);
        alert(`Error creating account: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Login flow - verify with Firebase
    try {
      const user = await UserService.verifyLogin(phone, password, 'buyer');
      if (user) {
        if (user.isComplete) {
          // User profile is complete, go to dashboard
          onNavigate('buyer-dashboard');
        } else {
          // User exists but profile incomplete, go to setup
          onNavigate('buyer-setup', { phone });
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

  const handleForgotPassword = async () => {
    if (!phone.trim()) {
      alert('Please enter your phone number first.');
      return;
    }
    
    setIsLoading(true);
    try {
      await PasswordResetService.initiatePasswordReset(phone, 'buyer');
      setShowForgotPassword(true);
      setResetStep('otp');
      alert('OTP sent to your phone for password reset.');
    } catch (error: any) {
      alert(error.message || 'Failed to send reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    try {
      await PasswordResetService.resetPasswordWithOTP(phone, otp, newPassword, 'buyer');
      alert('Password reset successful! You can now login with your new password.');
      setShowForgotPassword(false);
      setResetStep('phone');
      setOtp('');
      setNewPassword('');
    } catch (error: any) {
      alert(error.message || 'Failed to reset password.');
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

        {!showForgotPassword ? (
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#333]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-[#154731] hover:underline"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
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
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-[#154731]">Reset Password</h3>
              <p className="text-sm text-[#666]">Phone: {phone}</p>
            </div>
            
            {resetStep === 'otp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="1234"
                    maxLength={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                    required
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="btn-secondary w-full"
                  type="button"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

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
