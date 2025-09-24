import pandas as pd
from catboost import CatBoostRegressor

# Load dataset for testing
df = pd.read_csv('synthetic_craft_prices.csv')

categorical_features = ['Region', 'Category', 'Crafting Process']
numeric_features = ['Base Material Price', 'Dimensions', 'Hours of Labor', 'Transport Distance']
feature_cols = numeric_features + categorical_features

X = df[feature_cols]
y = df['Price']

# Load trained model
model = CatBoostRegressor()
model.load_model("catboost_craft_price.cbm")
print("Model loaded successfully!")

# Predict
y_pred = model.predict(X)

# Function to create price range ±10%
def price_range(pred, margin=0.1):
    return round(pred*(1-margin),2), round(pred*(1+margin),2)

# Create results DataFrame
results = X.copy()
results['Actual Price'] = y
results['Predicted Price'] = y_pred
results['Suggested Price Range'] = results['Predicted Price'].apply(lambda x: price_range(x))

# Show first 20 test samples
print(results[['Actual Price', 'Predicted Price', 'Suggested Price Range']].head(20))
