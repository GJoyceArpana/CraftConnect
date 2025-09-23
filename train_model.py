import json
import random
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from backend.estimator import estimate_eco_impact

# --- Step 1: Generate synthetic dataset ---
# We'll take each product and add small variations to create "fake" training samples
with open("tests/sample_data.json") as f:
    base_products = json.load(f)

data = []
labels = []

for p in base_products:
    for _ in range(30):  # generate 30 synthetic variations per product
        # Add small random variation to inputs
        weight = p["weight_g"] * random.uniform(0.8, 1.2)
        distance = p["distance_km_to_market"] * random.uniform(0.7, 1.3)
        recycled = max(0, min(100, p["percent_recycled_material"] + random.randint(-5, 5)))

        # Make a new product dict
        new_p = {
            "name": p["name"],
            "category": p["category"],
            "weight_g": weight,
            "materials": p["materials"],
            "percent_recycled_material": recycled,
            "production_method": p["production_method"],
            "distance_km_to_market": distance,
            "packaging_weight_g": p["packaging_weight_g"]
        }

        # Use estimator to compute "ground truth"
        carbon, score = estimate_eco_impact(new_p)

        # Features (numeric only for now)
        features = [weight, distance, recycled, p["packaging_weight_g"]]
        data.append(features)
        labels.append(carbon)  # target: carbon footprint

# Convert to numpy arrays
X = np.array(data)
y = np.array(labels)

# --- Step 2: Split dataset ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- Step 3: Train regression model ---
model = LinearRegression()
model.fit(X_train, y_train)

# --- Step 4: Evaluate ---
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)

print("✅ Model trained")
print("MSE on test set:", mse)

# --- Step 5: Test with one example ---
sample = X_test[0].reshape(1, -1)
print("Example features:", sample)
print("Predicted carbon footprint:", model.predict(sample))
print("Actual carbon footprint:", y_test[0])
