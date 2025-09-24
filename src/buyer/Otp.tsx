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

    // Validate OTP format
    if (otp.length !== 4) {
      alert('Please enter a 4-digit OTP');
      setIsVerifying(false);
      return;
    }

    try {
      console.log('🔐 Verifying OTP...');
      console.log('📞 Phone:', tempData.phone);
      console.log('🔢 OTP:', otp);
      console.log('📡 API URL:', 'http://127.0.0.1:5000/verify-otp');
      
      const response = await fetch('http://127.0.0.1:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: tempData.phone, 
          otp 
        }),
      });

      console.log('🌐 Verify Response status:', response.status);
      const data = await response.json();
      console.log('📨 Verify API Response:', data);

      if (data.success) {
        console.log('✅ OTP verified successfully!');
        // OTP verified successfully
        if (tempData.isSignUp) {
          console.log('🚀 Navigating to set password for signup');
          // For signup, go to set password
          onNavigate('buyer-setpassword', tempData);
        } else {
          console.log('🚀 Navigating to dashboard for login');
          // For existing user login via OTP, go to dashboard
          onNavigate('buyer-dashboard');
        }
      } else {
        console.error('❌ OTP verification failed:', data);
        const errorMsg = data.error || 'Invalid OTP. Please try again.';
        const remainingAttempts = data.attempts_remaining;
        
        if (remainingAttempts !== undefined) {
          alert(`${errorMsg}\n\nAttempts remaining: ${remainingAttempts}`);
        } else {
          alert(errorMsg);
        }
      }
    } catch (error) {
      console.error('🚨 Network error verifying OTP:', error);
      alert('Network error. Please check your connection and try again.\n\nMake sure the backend server is running.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    
    try {
      console.log('🔄 Resending OTP to:', tempData.phone);
      
      const response = await fetch('http://127.0.0.1:5000/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: tempData.phone }),
      });

      console.log('🌐 Resend Response status:', response.status);
      const data = await response.json();
      console.log('📨 Resend API Response:', data);

      if (data.success) {
        setTimer(30);
        console.log('✅ OTP resent successfully');
        
        if (data.dev_otp) {
          console.log('🔧 DEV MODE - New 4-digit OTP:', data.dev_otp);
          alert(`🔄 OTP Resent!\n\n🔧 DEV MODE\nNew 4-digit OTP: ${data.dev_otp}\n\nPhone: ${tempData.phone}\n\nExpires in 5 minutes.`);
        } else {
          alert(`📱 OTP resent to ${tempData.phone}\n\nCheck your SMS messages.`);
        }
      } else {
        console.error('❌ Resend failed:', data);
        alert(`Failed to resend OTP: ${data.error || 'Unknown error'}\n\nPlease try again later.`);
      }
    } catch (error) {
      console.error('🚨 Network error resending OTP:', error);
      alert('Network error. Please check your connection and try again.\n\nMake sure the backend server is running.');
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
