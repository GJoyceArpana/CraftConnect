import React, { useState, useEffect } from 'react';

const BuyerOtp = ({ onNavigate, onBack, tempData }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock OTP validation (in production, verify with backend)
    if (otp === '1234' || otp.length === 4) {
      if (tempData.isSignUp) {
        onNavigate('buyer-setpassword', tempData);
      } else {
        onNavigate('buyer-dashboard');
      }
    } else {
      alert('Invalid OTP. Use 1234 for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#154731] mb-2">
            Verify Phone Number
          </h2>
          <p className="text-[#666] mb-4">
            We've sent an OTP to {tempData.phone}
          </p>
          <p className="text-sm text-[#d67a4a] font-medium">
            Demo OTP: 1234
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button type="submit" className="btn-primary w-full">
            Verify OTP
          </button>
        </form>

        <div className="mt-6 text-center">
          {timer > 0 ? (
            <p className="text-[#666]">
              Resend OTP in {timer}s
            </p>
          ) : (
            <button className="text-[#154731] font-medium hover:underline">
              Resend OTP
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-[#666] hover:text-[#333] font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerOtp;