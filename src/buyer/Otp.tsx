// src/BuyerOtp.tsx
import React, { useState, useEffect, FormEvent } from 'react';

type TempData = {
  phone?: string;
  isSignUp?: boolean;
  [k: string]: any;
};

type NavigateFn = (path: string, payload?: any) => void;

type BuyerOtpProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
  tempData?: TempData;
};

const BuyerOtp: React.FC<BuyerOtpProps> = ({ onNavigate, onBack, tempData = {} }) => {
  const [otp, setOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: tempData.phone, 
          otp 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // OTP verified successfully
        if (tempData.isSignUp) {
          // For signup, go to set password
          onNavigate('buyer-setpassword', tempData);
        } else {
          // For existing user login via OTP, go to dashboard
          onNavigate('buyer-dashboard');
        }
      } else {
        alert(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    
    try {
      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: tempData.phone }),
      });

      const data = await response.json();

      if (data.success) {
        setTimer(30);
        alert(`OTP resent to ${tempData.phone}`);
      } else {
        alert(data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#154731] mb-2">Verify Phone Number</h2>
          <p className="text-[#666] mb-4">
            We've sent an OTP to {tempData.phone ?? '[phone number]'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#333] mb-2">Enter OTP</label>
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

          <button type="submit" className="btn-primary w-full" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {timer > 0 ? (
            <p className="text-[#666]">Resend OTP in {timer}s</p>
          ) : (
            <button
              onClick={handleResend}
              className="text-[#154731] font-medium hover:underline"
              disabled={isResending}
            >
              {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-[#666] hover:text-[#333] font-medium">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerOtp;
