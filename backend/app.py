import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from estimator import estimate_eco_impact

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# JSON file paths
ECO_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "tests", "sample_data.json")

# Create directories if they don't exist
os.makedirs(os.path.dirname(ECO_DATA_FILE), exist_ok=True)

# --- Price Service Routes (Placeholder for future implementation) ---

@app.route("/suggest_price", methods=["POST"])
def suggest_price_api():
    """Suggest fair price for a product - placeholder"""
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

# --- Carbon Footprint Routes ---

def load_products():
    """Load products from eco data file"""
    if os.path.exists(ECO_DATA_FILE):
        with open(ECO_DATA_FILE) as f:
            return json.load(f)
    return []

def save_products(products):
    """Save products to eco data file"""
    with open(ECO_DATA_FILE, "w") as f:
        json.dump(products, f, indent=2)

@app.route("/", methods=["GET"])
def home():
    """API home endpoint"""
    return jsonify({
        "message": "CraftConnect Unified API is running 🚀", 
        "endpoints": ["/suggest_price", "/save_price", "/products", "/predict", "/carbon_footprint"]
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