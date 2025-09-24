import pandas as pd
import numpy as np

np.random.seed(42)
n_samples = 2000

# Categorical features
regions = ['North India', 'South India', 'East India', 'West India', 'Central India']
categories = ['Textiles', 'Terracotta Pottery', 'Bamboo Products', 'Toys', 'Painting & Decorative Arts']
crafting_processes = ['Handwoven', 'Handmade', 'Machine-Assisted', 'Hand-Painted']

# Numeric features ranges
base_price_range = (50, 2000)        # ₹
hours_range = (1, 100)
dimensions_range = (100, 10000)      # volume/size unit
distance_range = (1, 1000)           # km

# Generate synthetic data
data = {
    'Region': np.random.choice(regions, n_samples),
    'Category': np.random.choice(categories, n_samples),
    'Crafting Process': np.random.choice(crafting_processes, n_samples),
    'Base Material Price': np.random.uniform(*base_price_range, n_samples).round(2),
    'Dimensions': np.random.uniform(*dimensions_range, n_samples).round(2),
    'Hours of Labor': np.random.uniform(*hours_range, n_samples).round(1),
    'Transport Distance': np.random.uniform(*distance_range, n_samples).round(1)
}

df = pd.DataFrame(data)

# Generate target price
def generate_price(row):
    base = row['Base Material Price']
    labor_factor = row['Hours of Labor'] * 10
    process_multiplier = 1.2 if row['Crafting Process'] in ['Handmade', 'Handwoven', 'Hand-Painted'] else 1.0
    noise = np.random.normal(0, 50)
    return max((base + labor_factor) * process_multiplier + noise, 10)

df['Price'] = df.apply(generate_price, axis=1).round(2)

# Save dataset
df.to_csv('synthetic_craft_prices.csv', index=False)
print("Synthetic dataset saved as 'synthetic_craft_prices.csv'")
