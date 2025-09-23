// Note: For security reasons, Twilio operations should ideally be handled on the backend
// This is a client-side implementation for development purposes

export interface SMSRequest {
  to: string;
  message: string;
}

export interface OTPVerificationRequest {
  to: string;
  code: string;
}

class TwilioService {
  private baseUrl: string;

  constructor() {
    // Use backend API for secure Twilio operations
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  }

  // Send SMS using backend API
  async sendSMS(request: SMSRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: request.to,
          message: request.message
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('SMS sent successfully:', data.sid);
          return true;
        } else {
          console.error('Failed to send SMS:', data.error);
          return false;
        }
      } else {
        const error = await response.json();
        console.error('Failed to send SMS:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Send OTP using backend API
  async sendOTP(phoneNumber: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('OTP sent successfully:', data.status);
          return true;
        } else {
          console.error('Failed to send OTP:', data.error);
          return false;
        }
      } else {
        const error = await response.json();
        console.error('Failed to send OTP:', error);
        return false;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }

  // Verify OTP using backend API
  async verifyOTP(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: code
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('OTP verification successful:', data.status);
          return true;
        } else {
          console.error('Failed to verify OTP:', data.error);
          return false;
        }
      } else {
        const error = await response.json();
        console.error('Failed to verify OTP:', error);
        return false;
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }

  // Format phone number to E.164 format
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }
    
    return phoneNumber;
  }
}

export const twilioService = new TwilioService();
export default TwilioService;