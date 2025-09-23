# from flask import Flask
# from models import db, Product

# app = Flask(__name__)

# # Database config (SQLite)
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# db.init_app(app)

# @app.route("/")
# def home():
#     return {"message": "Eco Impact Badge Backend is running 🚀"}

# if __name__ == "__main__":
#     with app.app_context():
#         db.create_all()  # create tables if not exist
#     app.run(debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from dotenv import load_dotenv
from estimator import estimate_eco_impact
from twilio_service import twilio_service

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

DATA_FILE = os.path.join(os.path.dirname(__file__), "../tests/sample_data.json")

# Create directories if they don't exist
os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)

# --- Load products ---
def load_products():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return []

# --- Save products ---
def save_products(products):
    with open(DATA_FILE, "w") as f:
        json.dump(products, f, indent=2)

# --- Routes ---

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "CraftConnect Backend API is running 🚀", 
        "endpoints": ["/products", "/predict", "/send-otp", "/verify-otp", "/send-sms"]
    })

@app.route("/products", methods=["GET"])
def list_products():
    """Return all products"""
    return jsonify(load_products())

@app.route("/products", methods=["POST"])
def add_product():
    """Save a new product"""
    products = load_products()
    new_product = request.json
    products.append(new_product)
    save_products(products)
    return jsonify({"status": "success", "message": "Product added"}), 201

@app.route("/predict", methods=["POST"])
def predict():
    """Predict eco impact for a given product"""
    product = request.json
    carbon, score = estimate_eco_impact(product)
    return jsonify({
        "carbon_footprint": carbon,
        "sustainability_score": score
    })

# Twilio endpoints for secure SMS operations
@app.route("/send-otp", methods=["POST"])
def send_otp():
    """Send OTP via SMS using Twilio"""
    data = request.json
    phone_number = data.get('phone_number')
    
    if not phone_number:
        return jsonify({'success': False, 'error': 'Phone number is required'}), 400
    
    result = twilio_service.send_otp(phone_number)
    return jsonify(result)

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    """Verify OTP using Twilio"""
    data = request.json
    phone_number = data.get('phone_number')
    code = data.get('code')
    
    if not phone_number or not code:
        return jsonify({'success': False, 'error': 'Phone number and code are required'}), 400
    
    result = twilio_service.verify_otp(phone_number, code)
    return jsonify(result)

@app.route("/send-sms", methods=["POST"])
def send_sms():
    """Send custom SMS using Twilio"""
    data = request.json
    phone_number = data.get('phone_number')
    message = data.get('message')
    
    if not phone_number or not message:
        return jsonify({'success': False, 'error': 'Phone number and message are required'}), 400
    
    result = twilio_service.send_sms(phone_number, message)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
