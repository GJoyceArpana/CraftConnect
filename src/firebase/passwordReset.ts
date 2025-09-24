import { UserService } from './userService';

export class PasswordResetService {
  
  // Check if user exists and send OTP for password reset
  static async initiatePasswordReset(phone: string, userType: 'buyer' | 'seller'): Promise<boolean> {
    try {
      // Check if user exists
      const userExists = await UserService.userExists(phone, userType);
      if (!userExists) {
        throw new Error('No account found with this phone number.');
      }

      // Send OTP via backend
      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Password reset initiation failed:', error);
      throw error;
    }
  }

  // Verify OTP and reset password
  static async resetPasswordWithOTP(phone: string, otp: string, newPassword: string, userType: 'buyer' | 'seller'): Promise<boolean> {
    try {
      // First verify the OTP
      const verifyResponse = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Invalid OTP');
      }

      // OTP verified, now update password in Firebase
      await UserService.setUserPassword(phone, newPassword, userType);
      
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }
}

// For development console access
if (typeof window !== 'undefined') {
  (window as any).PasswordResetService = PasswordResetService;
}