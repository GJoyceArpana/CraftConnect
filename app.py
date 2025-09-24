# from flask import Flask, request, jsonify
# from catboost import CatBoostRegressor
# import pandas as pd

# app = Flask(__name__)

# # Load trained model once
# model = CatBoostRegressor()
# model.load_model("catboost_craft_price.cbm")

# # Function to create price range ±10%
# def price_range(pred, margin=0.1):
#     return round(pred*(1-margin),2), round(pred*(1+margin),2)

# @app.route('/')
# def home():
#     return "Flask server is running. Use POST /predict to get price prediction."


# @app.route('/predict', methods=['POST'])
# def predict():
#     data = request.json
#     # Expected input JSON keys: Region, Category, Crafting Process, Base Material Price, Dimensions, Hours of Labor, Transport Distance
#     try:
#         # Convert input to DataFrame
#         df_input = pd.DataFrame([data])
        
#         # Ensure proper column order
#         feature_cols = ['Base Material Price', 'Dimensions', 'Hours of Labor', 'Transport Distance',
#                         'Region', 'Category', 'Crafting Process']
#         df_input = df_input[feature_cols]
        
#         # Predict price
#         pred = model.predict(df_input)[0]
#         price_min, price_max = price_range(pred)
        
#         return jsonify({
#             "predicted_price": round(pred, 2),
#             "price_range": [price_min, price_max]
#         })
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask, request, jsonify, render_template
from catboost import CatBoostRegressor
import pandas as pd
import os

app = Flask(__name__)

# Load trained CatBoost model
model = CatBoostRegressor()
model.load_model("catboost_craft_price.cbm")

# CSV file to save predictions
SAVE_FILE = "predictions.csv"

# Function to create price range ±10%
def price_range(pred, margin=0.1):
    return round(pred*(1-margin),2), round(pred*(1+margin),2)

@app.route('/')
def home():
    return render_template("index.html")  # HTML form in templates folder

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json  # Receive JSON input from frontend
    try:
        feature_cols = ['Base Material Price', 'Dimensions', 'Hours of Labor', 'Transport Distance',
                        'Region', 'Category', 'Crafting Process']
        df_input = pd.DataFrame([data])
        df_input = df_input[feature_cols]

        # Predict price
        pred = model.predict(df_input)[0]
        price_min, price_max = price_range(pred)

        # Save input + prediction to CSV
        record = data.copy()
        record['Predicted Price'] = round(pred,2)
        record['Price Min'] = price_min
        record['Price Max'] = price_max

        if os.path.exists(SAVE_FILE):
            df_save = pd.read_csv(SAVE_FILE)
            df_save = pd.concat([df_save, pd.DataFrame([record])], ignore_index=True)
        else:
            df_save = pd.DataFrame([record])

        df_save.to_csv(SAVE_FILE, index=False)

        return jsonify({
            "predicted_price": round(pred,2),
            "price_range": [price_min, price_max]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/history', methods=['GET'])
def history():
    # Return all saved predictions
    if os.path.exists(SAVE_FILE):
        df_history = pd.read_csv(SAVE_FILE)
        return df_history.to_json(orient='records')
    else:
        return jsonify([])

if __name__ == "__main__":
    app.run(debug=True)
