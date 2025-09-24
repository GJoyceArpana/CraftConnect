// src/SellerOtp.tsx
import React, { useState, useEffect, FormEvent } from 'react';

type NavigateFn = (path: string, payload?: any) => void;

type SellerOtpProps = {
  onNavigate: NavigateFn;
  onBack: () => void;
  tempData: { phone: string; isSignUp: boolean };
};

const SellerOtp: React.FC<SellerOtpProps> = ({ onNavigate, onBack, tempData }) => {
  const [otp, setOtp] = useState<string>('');
  const [timer, setTimer] = useState<number>(30);

  // countdown for resend button
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mock OTP validation (replace with real backend in production)
    if (otp === '1234' || otp.length === 4) {
      if (tempData.isSignUp) {
        onNavigate('seller-setpassword', tempData);
      } else {
        onNavigate('seller-dashboard');
      }
    } else {
      alert('Invalid OTP. Use 1234 for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#d67a4a] mb-2">Verify Phone Number</h2>
          <p className="text-[#666] mb-4">
            We've sent an OTP to <strong>{tempData.phone}</strong>
          </p>
          <p className="text-sm text-[#d67a4a] font-medium">Demo OTP: 1234</p>
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

          <button type="submit" className="btn-primary w-full">
            Verify OTP
          </button>
        </form>

        <div className="mt-6 text-center">
          {timer > 0 ? (
            <p className="text-[#666]">Resend OTP in {timer}s</p>
          ) : (
            <button
              type="button"
              className="text-[#d67a4a] font-medium hover:underline"
              onClick={() => setTimer(30)} // restart timer on resend
            >
              Resend OTP
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-[#666] hover:text-[#333] font-medium" type="button">
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerOtp;
