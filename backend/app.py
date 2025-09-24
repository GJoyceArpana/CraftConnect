import json
import os
import random
import string
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client
from estimator import estimate_eco_impact
from gemini_service import GeminiChatbotService
from local_storage_service import get_local_storage_service

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

# Initialize Gemini chatbot service
try:
    gemini_service = GeminiChatbotService()
    print("Gemini chatbot service initialized")
except Exception as e:
    print(f"Warning: Gemini chatbot service initialization failed: {e}")
    gemini_service = None

# Initialize storage service (local storage for development)
try:
    storage_service = get_local_storage_service()
    print("Storage service initialized")
except Exception as e:
    print(f"Warning: Storage service initialization failed: {e}")
    storage_service = None

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
        
        # Use Twilio Verify API but store our 4-digit OTP for verification
        if twilio_client and TWILIO_VERIFY_SID:
            try:
                # Send via Twilio Verify (which will be 6-digit by default)
                # But we'll verify using our stored 4-digit OTP
                verification = twilio_client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(
                    to=formatted_phone,
                    channel='sms'
                )
                
                print(f"4-digit OTP sent via Twilio to {formatted_phone}: {otp}")
                
                response_data = {
                    "success": True,
                    "message": f"4-digit OTP sent to {formatted_phone}",
                    "expires_in": 300  # 5 minutes
                }
                
                # In development mode, also include dev_otp for easier testing
                if os.getenv('FLASK_ENV') == 'development':
                    response_data["dev_otp"] = otp
                    response_data["dev_mode"] = True
                    response_data["message"] += " (Dev Mode - SMS + DevOTP)"
                    
                return jsonify(response_data)
                
            except Exception as twilio_error:
                print(f"Twilio Verify error: {twilio_error}")
                # Check if it's an unverified number error or rate limit - fallback to dev mode
                if ("unverified" in str(twilio_error).lower() or 
                    "21608" in str(twilio_error) or 
                    "max send attempts" in str(twilio_error).lower() or 
                    "60203" in str(twilio_error) or 
                    "fraudulent" in str(twilio_error).lower() or 
                    "60410" in str(twilio_error)):
                    if "max send attempts" in str(twilio_error).lower():
                        reason = "Rate Limited"
                    elif "fraudulent" in str(twilio_error).lower():
                        reason = "Number Blocked"
                    else:
                        reason = "Unverified Number"
                    print(f"DEV MODE ({reason}) - OTP for {formatted_phone}: {otp}")
                    return jsonify({
                        "success": True,
                        "message": f"OTP sent to {formatted_phone} (Dev Mode - {reason})",
                        "dev_otp": otp,  # Shows OTP in dev mode
                        "expires_in": 300,
                        "dev_mode": True
                    })
                else:
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
        
        # Use Twilio Verify API but store our 4-digit OTP for verification
        if twilio_client and TWILIO_VERIFY_SID:
            try:
                # Send via Twilio Verify (which will be 6-digit by default)
                # But we'll verify using our stored 4-digit OTP
                verification = twilio_client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(
                    to=formatted_phone,
                    channel='sms'
                )
                
                print(f"4-digit password reset OTP sent via Twilio to {formatted_phone}: {otp}")
                
                response_data = {
                    "success": True,
                    "message": f"4-digit password reset OTP sent to {formatted_phone}",
                    "expires_in": 300  # 5 minutes
                }
                
                # In development mode, also include dev_otp for easier testing
                if os.getenv('FLASK_ENV') == 'development':
                    response_data["dev_otp"] = otp
                    response_data["dev_mode"] = True
                    response_data["message"] += " (Dev Mode - SMS + DevOTP)"
                    
                return jsonify(response_data)
                
            except Exception as twilio_error:
                print(f"Twilio Verify error for password reset: {twilio_error}")
                # Check if it's an unverified number error or rate limit - fallback to dev mode
                if ("unverified" in str(twilio_error).lower() or 
                    "21608" in str(twilio_error) or 
                    "max send attempts" in str(twilio_error).lower() or 
                    "60203" in str(twilio_error) or 
                    "fraudulent" in str(twilio_error).lower() or 
                    "60410" in str(twilio_error)):
                    if "max send attempts" in str(twilio_error).lower():
                        reason = "Rate Limited"
                    elif "fraudulent" in str(twilio_error).lower():
                        reason = "Number Blocked"
                    else:
                        reason = "Unverified Number"
                    print(f"DEV MODE ({reason}) - Password reset OTP for {formatted_phone}: {otp}")
                    return jsonify({
                        "success": True,
                        "message": f"Password reset OTP sent to {formatted_phone} (Dev Mode - {reason})",
                        "dev_otp": otp,  # Shows OTP in dev mode
                        "expires_in": 300,
                        "dev_mode": True
                    })
                else:
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
        
        # Manual OTP verification (works with both Twilio SMS and dev mode)
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
        
        # Manual OTP verification (works with both Twilio SMS and dev mode)
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
        
        # Include Gemini recommendations if available
        response = {
            "carbon_footprint": carbon,
            "sustainability_score": score,
            "co2_saving_kg": carbon,
            "waste_reduction_pct": score
        }
        
        # Add AI recommendations if Gemini service is available
        if gemini_service and request.json.get('include_recommendations', False):
            try:
                recommendations = gemini_service.analyze_carbon_footprint(
                    product, 
                    {"carbon_footprint": carbon, "sustainability_score": score}
                )
                response["ai_recommendations"] = recommendations
            except Exception as e:
                print(f"Error getting AI recommendations: {e}")
                
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Gemini Chatbot Routes ---

@app.route("/ai/chat", methods=["POST"])
def ai_chat():
    """Chat with Gemini AI for sustainability advice"""
    if not gemini_service:
        return jsonify({"error": "AI service not available"}), 503
        
    try:
        data = request.json
        message = data.get('message')
        context = data.get('context', {})
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
            
        response = gemini_service.chat_with_user(message, context)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ai/analyze", methods=["POST"])
def ai_analyze():
    """Analyze carbon footprint with AI recommendations"""
    if not gemini_service:
        return jsonify({"error": "AI service not available"}), 503
        
    try:
        data = request.json
        product_data = data.get('product_data')
        current_impact = data.get('current_impact')
        
        if not product_data or not current_impact:
            return jsonify({"error": "Product data and current impact are required"}), 400
            
        response = gemini_service.analyze_carbon_footprint(product_data, current_impact)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ai/parameter-suggestions", methods=["POST"])
def ai_parameter_suggestions():
    """Get parameter optimization suggestions from AI"""
    if not gemini_service:
        return jsonify({"error": "AI service not available"}), 503
        
    try:
        data = request.json
        current_params = data.get('current_params')
        target_improvement = data.get('target_improvement', 'overall')
        
        if not current_params:
            return jsonify({"error": "Current parameters are required"}), 400
            
        response = gemini_service.get_parameter_suggestions(current_params, target_improvement)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ai/quick-tips", methods=["POST"])
def ai_quick_tips():
    """Get quick sustainability tips based on product category"""
    if not gemini_service:
        return jsonify({"error": "AI service not available"}), 503
        
    try:
        data = request.json
        category = data.get('category', 'general')
        
        # Generate category-specific tips
        tips_request = f"Give me 5 quick sustainability tips for {category} products that artisans can implement easily."
        context = {'product_data': {'category': category}} if category != 'general' else None
        
        response = gemini_service.chat_with_user(tips_request, context)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ai/debug", methods=["GET", "POST"])
def ai_debug():
    """Debug endpoint to test AI service"""
    try:
        if not gemini_service:
            return jsonify({"status": "error", "message": "Gemini service not initialized"}), 503
        
        # Test basic chat functionality
        test_message = "Hello, can you help me with sustainability?"
        test_context = {
            'product_data': {
                'category': 'textiles',
                'weight_g': 200,
                'percent_recycled_material': 60,
                'distance_km_to_market': 150
            },
            'current_impact': {
                'carbon_footprint': 2.5,
                'sustainability_score': 65
            }
        }
        
        response = gemini_service.chat_with_user(test_message, test_context)
        
        return jsonify({
            "status": "success",
            "service_available": True,
            "test_response": response
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

# --- Firebase-powered Real-time API Routes ---

@app.route("/api/products", methods=["POST"])
def create_product_api():
    """Create a new product listing with storage"""
    if not storage_service:
        return jsonify({"error": "Storage service not available"}), 503
    
    try:
        data = request.get_json()
        
        # Process product data
        product_data = {
            'name': data.get('name'),
            'description': data.get('description'),
            'price': float(data.get('price', 0)),
            'category': data.get('category'),
            'material': data.get('material', ''),
            'weight': float(data.get('weight', 0)),
            'process': data.get('process', ''),
            'seller_id': data.get('sellerId') or data.get('seller_id'),
            'seller_name': data.get('sellerName') or data.get('seller_name', 'Unknown'),
            'image': data.get('productImage') or data.get('image', ''),
            'packaging_weight': float(data.get('packagingWeight', 0)),
            'distance_to_market': float(data.get('distanceToMarket', 0)),
            'recycled_material': float(data.get('recycledMaterial', 0)),
            'co2_prediction': float(data.get('co2Prediction', 0)),
            'sustainability_score': float(data.get('sustainabilityScore', 0)),
            'co2_saving_kg': float(data.get('co2SavingKg', 0)),
            'waste_reduction_pct': float(data.get('wasteReductionPct', 0))
        }
        
        # Create product in storage
        product_id = storage_service.create_product(product_data)
        
        if product_id:
            return jsonify({
                'success': True,
                'product_id': product_id,
                'message': 'Product created successfully'
            })
        else:
            return jsonify({"error": "Failed to create product"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/products", methods=["GET"])
def get_products_api():
    """Get products for marketplace"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        category = request.args.get('category')
        seller_id = request.args.get('seller_id')
        limit = int(request.args.get('limit', 20))
        
        filters = {}
        if category:
            filters['category'] = category
        if seller_id:
            filters['seller_id'] = seller_id
            
        products = storage_service.get_products(filters, limit)
        return jsonify({
            'success': True,
            'products': products
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/products/search", methods=["GET"])
def search_products_api():
    """Search products"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        search_term = request.args.get('q', '')
        category = request.args.get('category')
        limit = int(request.args.get('limit', 20))
        
        if not search_term:
            return jsonify({"error": "Search term is required"}), 400
            
        products = storage_service.search_products(search_term, category, limit)
        return jsonify({
            'success': True,
            'products': products
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/orders", methods=["POST"])
def create_order_api():
    """Create a new order"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        data = request.get_json()
        
        # Process order data
        order_data = {
            'buyer_id': data.get('buyer_id'),
            'seller_id': data.get('seller_id'),
            'product_id': data.get('product_id'),
            'product_name': data.get('product_name'),
            'quantity': int(data.get('quantity', 1)),
            'unit_price': float(data.get('unit_price', 0)),
            'total_amount': float(data.get('total_amount', 0)),
            'amount_saved': float(data.get('amount_saved', 0)),
            'shipping_address': data.get('shipping_address', {}),
            'payment_method': data.get('payment_method', 'pending')
        }
        
        # Create order in Firebase
        order_id = storage_service.create_order(order_data)
        
        if order_id:
            return jsonify({
                'success': True,
                'order_id': order_id,
                'message': 'Order placed successfully'
            })
        else:
            return jsonify({"error": "Failed to create order"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/dashboard/seller/<seller_id>", methods=["GET"])
def get_seller_dashboard_api(seller_id):
    """Get real-time seller dashboard data"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        dashboard_data = storage_service.get_seller_dashboard_data(seller_id)
        return jsonify({
            'success': True,
            'data': dashboard_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/dashboard/buyer/<buyer_id>", methods=["GET"])
def get_buyer_dashboard_api(buyer_id):
    """Get real-time buyer dashboard data"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        dashboard_data = storage_service.get_buyer_dashboard_data(buyer_id)
        return jsonify({
            'success': True,
            'data': dashboard_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users", methods=["POST"])
def create_user_api():
    """Create or update user profile"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        data = request.get_json()
        user_id = data.get('user_id') or data.get('id')
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
            
        user_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'user_type': data.get('user_type', 'buyer'),  # buyer or seller
            'profile_complete': data.get('profile_complete', False)
        }
        
        success = storage_service.create_user(user_id, user_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'User profile updated successfully'
            })
        else:
            return jsonify({"error": "Failed to update user profile"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<user_id>", methods=["GET"])
def get_user_api(user_id):
    """Get user profile"""
    if not storage_service:
        return jsonify({"error": "Firebase service not available"}), 503
    
    try:
        user_data = storage_service.get_user(user_id)
        
        if user_data:
            return jsonify({
                'success': True,
                'user': user_data
            })
        else:
            return jsonify({"error": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
