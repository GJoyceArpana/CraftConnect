from twilio.rest import Client
import os
from typing import Dict, Any
import re

class TwilioService:
    def __init__(self):
        # Load Twilio credentials from environment
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.verify_service_sid = os.getenv('TWILIO_VERIFY_SERVICE_SID')
        
        if not all([self.account_sid, self.auth_token, self.phone_number]):
            print("Warning: Twilio credentials not found in environment variables")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
    
    def format_phone_number(self, phone_number: str) -> str:
        """Format phone number to E.164 format for India"""
        # Remove all non-digit characters
        cleaned = re.sub(r'\D', '', phone_number)
        
        # Add country code if not present (assuming India +91)
        if len(cleaned) == 10:
            return f'+91{cleaned}'
        elif len(cleaned) == 12 and cleaned.startswith('91'):
            return f'+{cleaned}'
        elif cleaned.startswith('+'):
            return phone_number  # Already formatted
        
        return phone_number
    
    def send_sms(self, to: str, message: str) -> Dict[str, Any]:
        """Send SMS using Twilio"""
        if not self.client:
            return {
                'success': False,
                'error': 'Twilio client not initialized. Check credentials.'
            }
        
        try:
            formatted_to = self.format_phone_number(to)
            
            message = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=formatted_to
            )
            
            return {
                'success': True,
                'sid': message.sid,
                'status': message.status
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_otp(self, phone_number: str) -> Dict[str, Any]:
        """Send OTP using Twilio Verify Service"""
        if not self.client or not self.verify_service_sid:
            return {
                'success': False,
                'error': 'Twilio Verify service not configured'
            }
        
        try:
            formatted_phone = self.format_phone_number(phone_number)
            
            verification = self.client.verify \
                .v2 \
                .services(self.verify_service_sid) \
                .verifications \
                .create(to=formatted_phone, channel='sms')
            
            return {
                'success': True,
                'status': verification.status,
                'to': verification.to
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_otp(self, phone_number: str, code: str) -> Dict[str, Any]:
        """Verify OTP using Twilio Verify Service"""
        if not self.client or not self.verify_service_sid:
            return {
                'success': False,
                'error': 'Twilio Verify service not configured'
            }
        
        try:
            formatted_phone = self.format_phone_number(phone_number)
            
            verification_check = self.client.verify \
                .v2 \
                .services(self.verify_service_sid) \
                .verification_checks \
                .create(to=formatted_phone, code=code)
            
            return {
                'success': verification_check.status == 'approved',
                'status': verification_check.status
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Global instance
twilio_service = TwilioService()