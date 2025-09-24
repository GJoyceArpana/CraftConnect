import json
import os
import random
import string
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client
from estimator import estimate_eco_impact

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("Environment variables loaded from .env file")
except ImportError:
    print("python-dotenv not installed, using system environment variables")

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_VERIFY_SID = os.getenv('TWILIO_VERIFY_SID')  # Verify Service SID

# Initialize Twilio client
try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception as e:
    print(f"Warning: Twilio client initialization failed: {e}")
    twilio_client = None

# In-memory OTP storage (use Redis or database in production)
otp_storage = {}

def generate_otp():
    """Generate a 4-digit OTP"""
    return ''.join(random.choices(string.digits, k=4))

def format_phone_number(phone):
    """Format phone number for Twilio (add country code if needed)"""
    # Remove any non-digit characters
    phone = ''.join(filter(str.isdigit, phone))
    
    # Handle Indian phone numbers (+91 country code)
    if len(phone) == 10:
        # 10-digit number, assume Indian mobile number
        phone = '+91' + phone
    elif len(phone) == 12 and phone.startswith('91'):
        # 12-digit number starting with 91
        phone = '+' + phone
    elif len(phone) == 13 and phone.startswith('91'):
        # 13-digit number starting with 91 (with extra digit)
        phone = '+' + phone[:12]  # Keep only first 12 digits after +
    elif not phone.startswith('+'):
        # If no country code, assume Indian
        if len(phone) >= 10:
            phone = '+91' + phone[-10:]  # Take last 10 digits
        else:
            phone = '+91' + phone
    
    return phone

def clean_expired_otps():
    """Remove expired OTPs from storage"""
    current_time = datetime.now()
    expired_keys = []
    
    for phone, data in otp_storage.items():
        if current_time > data['expires_at']:
            expired_keys.append(phone)
    
    for key in expired_keys:
        del otp_storage[key]

# JSON file paths
DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "tests", "sample_data.json")

# Create directories if they don't exist
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

# --- Load and Save Products ---

def load_products():
    """Load products from data file"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return []

def save_products(products):
    """Save products to data file"""
    with open(DATA_FILE, "w") as f:
        json.dump(products, f, indent=2)

# --- Price Service Routes ---

@app.route("/suggest_price", methods=["POST"])
def suggest_price_api():
    """Suggest fair price for a product"""
    try:
        data = request.get_json()
        # Simple price suggestion based on category and materials
        base_price = data.get("base_price", 100)
        category_multiplier = {
            "terracotta": 1.2,
            "textiles": 1.5,
            "bamboo": 1.3,
            "toys": 1.1,
            "painting": 1.4
        }
        multiplier = category_multiplier.get(data.get("category", ""), 1.0)
        suggested_price = base_price * multiplier
        
        return jsonify({
            "suggested_price": round(suggested_price, 2),
            "confidence": 0.8,
            "message": "Price suggestion based on category analysis"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- OTP Routes ---

@app.route("/send-otp", methods=["POST"])
def send_otp():
    """Send OTP to phone number via SMS"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        
        if not phone:
            return jsonify({"error": "Phone number is required"}), 400
        
        # Clean expired OTPs
        clean_expired_otps()
        
        # Format phone number
        formatted_phone = format_phone_number(phone)
        
        # Generate OTP
        otp = generate_otp()
        
        # Store OTP with expiration (5 minutes)
        expires_at = datetime.now() + timedelta(minutes=5)
        otp_storage[formatted_phone] = {
            'otp': otp,
            'expires_at': expires_at,
            'attempts': 0
        }
        
        # Use Twilio Verify API with 4-digit OTP
        if twilio_client and TWILIO_VERIFY_SID:
            try:
                verification = twilio_client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(
                    to=formatted_phone,
                    channel='sms'
                )
                
                print(f"Verification sent to {formatted_phone}, status: {verification.status}")
                
                return jsonify({
                    "success": True,
                    "message": f"OTP sent to {formatted_phone}",
                    "expires_in": 600  # Twilio Verify default is 10 minutes
                })
                
            except Exception as twilio_error:
                print(f"Twilio Verify error: {twilio_error}")
                return jsonify({
                    "error": "Failed to send OTP",
                    "details": str(twilio_error)
                }), 500
        else:
            # Fallback: Generate and store OTP manually
            print(f"DEV MODE - OTP for {formatted_phone}: {otp}")
            return jsonify({
                "success": True,
                "message": f"OTP sent to {formatted_phone}",
                "dev_otp": otp,  # Shows OTP in dev mode
                "expires_in": 300
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Password Reset Routes ---

@app.route("/reset-password-otp", methods=["POST"])
def send_reset_password_otp():
    """Send OTP for password reset"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        user_type = data.get('user_type')  # 'buyer' or 'seller'
        
        if not phone or not user_type:
            return jsonify({"error": "Phone number and user type are required"}), 400
        
        if user_type not in ['buyer', 'seller']:
            return jsonify({"error": "Invalid user type"}), 400
        
        # Clean expired OTPs
        clean_expired_otps()
        
        # Format phone number
        formatted_phone = format_phone_number(phone)
        
        # Generate OTP for password reset (different key)
        otp = generate_otp()
        reset_key = f"reset_{formatted_phone}"
        
        # Store OTP with expiration (5 minutes)
        expires_at = datetime.now() + timedelta(minutes=5)
        otp_storage[reset_key] = {
            'otp': otp,
            'expires_at': expires_at,
            'attempts': 0,
            'user_type': user_type
        }
        
        # Use Twilio Verify API
        if twilio_client and TWILIO_VERIFY_SID:
            try:
                verification = twilio_client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(
                    to=formatted_phone,
                    channel='sms'
                )
                
                print(f"Password reset OTP sent to {formatted_phone}, status: {verification.status}")
                
                return jsonify({
                    "success": True,
                    "message": f"Password reset OTP sent to {formatted_phone}",
                    "expires_in": 600  # Twilio Verify default is 10 minutes
                })
                
            except Exception as twilio_error:
                print(f"Twilio Verify error for password reset: {twilio_error}")
                return jsonify({
                    "error": "Failed to send password reset OTP",
                    "details": str(twilio_error)
                }), 500
        else:
            # Fallback: Generate and store OTP manually
            print(f"DEV MODE - Password reset OTP for {formatted_phone}: {otp}")
            return jsonify({
                "success": True,
                "message": f"Password reset OTP sent to {formatted_phone}",
                "dev_otp": otp,  # Shows OTP in dev mode
                "expires_in": 300
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reset-password", methods=["POST"])
def reset_password():
    """Verify OTP and reset password"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        otp = data.get('otp')
        new_password = data.get('new_password')
        user_type = data.get('user_type')
        
        if not phone or not otp or not new_password or not user_type:
            return jsonify({"error": "Phone, OTP, new password, and user type are required"}), 400
        
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        # Clean expired OTPs
        clean_expired_otps()
        
        # Format phone number
        formatted_phone = format_phone_number(phone)
        reset_key = f"reset_{formatted_phone}"
        
        # Check if reset OTP exists
        if reset_key not in otp_storage:
            return jsonify({
                "success": False,
                "error": "Password reset OTP not found or expired"
            }), 400
        
        stored_data = otp_storage[reset_key]
        
        # Check attempts limit
        if stored_data['attempts'] >= 3:
            del otp_storage[reset_key]
            return jsonify({
                "success": False,
                "error": "Too many failed attempts. Please request a new password reset OTP."
            }), 400
        
        # Use Twilio Verify API for verification
        if twilio_client and TWILIO_VERIFY_SID:
            try:
                verification_check = twilio_client.verify.v2.services(TWILIO_VERIFY_SID).verification_checks.create(
                    to=formatted_phone,
                    code=otp
                )
                
                print(f"Password reset verification check for {formatted_phone}, status: {verification_check.status}")
                
                if verification_check.status == 'approved':
                    # Remove from local storage
                    if reset_key in otp_storage:
                        del otp_storage[reset_key]
                    
                    return jsonify({
                        "success": True,
                        "message": "OTP verified. Password can now be reset.",
                        "phone": formatted_phone,
                        "user_type": user_type
                    })
                else:
                    return jsonify({
                        "success": False,
                        "error": "Invalid or expired password reset OTP"
                    }), 400
                    
            except Exception as twilio_error:
                print(f"Twilio Verify error for password reset: {twilio_error}")
                return jsonify({
                    "success": False,
                    "error": "Failed to verify password reset OTP",
                    "details": str(twilio_error)
                }), 500
        else:
            # Fallback: Manual OTP verification
            if stored_data['otp'] == otp:
                # OTP is correct, remove from storage
                del otp_storage[reset_key]
                return jsonify({
                    "success": True,
                    "message": "OTP verified. Password can now be reset.",
                    "phone": formatted_phone,
                    "user_type": user_type
                })
            else:
                # Increment attempts
                stored_data['attempts'] += 1
                return jsonify({
                    "success": False,
                    "error": "Invalid password reset OTP",
                    "attempts_remaining": 3 - stored_data['attempts']
                }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    """Verify OTP for phone number"""
    try:
        data = request.get_json()
        phone = data.get('phone')
        otp = data.get('otp')
        
        if not phone or not otp:
            return jsonify({"error": "Phone number and OTP are required"}), 400
        
        # Clean expired OTPs
        clean_expired_otps()
        
        # Format phone number
        formatted_phone = format_phone_number(phone)
        
        # Check if OTP exists
        if formatted_phone not in otp_storage:
            return jsonify({
                "success": False,
                "error": "OTP not found or expired"
            }), 400
        
        stored_data = otp_storage[formatted_phone]
        
        # Check attempts limit
        if stored_data['attempts'] >= 3:
            del otp_storage[formatted_phone]
            return jsonify({
                "success": False,
                "error": "Too many failed attempts. Please request a new OTP."
            }), 400
        
        # Use Twilio Verify API for verification
        if twilio_client and TWILIO_VERIFY_SID:
            try:
                verification_check = twilio_client.verify.v2.services(TWILIO_VERIFY_SID).verification_checks.create(
                    to=formatted_phone,
                    code=otp
                )
                
                print(f"Verification check for {formatted_phone}, status: {verification_check.status}")
                
                if verification_check.status == 'approved':
                    # Remove from local storage if exists
                    if formatted_phone in otp_storage:
                        del otp_storage[formatted_phone]
                    
                    return jsonify({
                        "success": True,
                        "message": "OTP verified successfully"
                    })
                else:
                    return jsonify({
                        "success": False,
                        "error": "Invalid or expired OTP"
                    }), 400
                    
            except Exception as twilio_error:
                print(f"Twilio Verify error: {twilio_error}")
                return jsonify({
                    "success": False,
                    "error": "Failed to verify OTP",
                    "details": str(twilio_error)
                }), 500
        else:
            # Fallback: Manual OTP verification
            if stored_data['otp'] == otp:
                # OTP is correct, remove from storage
                del otp_storage[formatted_phone]
                return jsonify({
                    "success": True,
                    "message": "OTP verified successfully"
                })
            else:
                # Increment attempts
                stored_data['attempts'] += 1
                return jsonify({
                    "success": False,
                    "error": "Invalid OTP",
                    "attempts_remaining": 3 - stored_data['attempts']
                }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Main Routes ---

@app.route("/", methods=["GET"])
def home():
    """API home endpoint"""
    return jsonify({
        "message": "CraftConnect Unified API is running 🚀", 
        "endpoints": ["/suggest_price", "/products", "/predict", "/carbon_footprint", "/send-otp", "/verify-otp"]
    })

@app.route("/products", methods=["GET"])
def list_products():
    """Return all products with eco data"""
    return jsonify(load_products())

@app.route("/products", methods=["POST"])
def add_product():
    """Save a new product with eco data"""
    try:
        products = load_products()
        new_product = request.json
        products.append(new_product)
        save_products(products)
        return jsonify({"status": "success", "message": "Product added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
@app.route("/carbon_footprint", methods=["POST"])
def predict():
    """Predict eco impact for a given product"""
    try:
        product = request.json
        
        # Validate required fields
        required_fields = [
            "weight_g", "packaging_weight_g", "distance_km_to_market",
            "category", "percent_recycled_material", "production_method"
        ]
        
        for field in required_fields:
            if field not in product:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        carbon, score = estimate_eco_impact(product)
        return jsonify({
            "carbon_footprint": carbon,
            "sustainability_score": score,
            "co2_saving_kg": carbon,
            "waste_reduction_pct": score
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)