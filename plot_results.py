import json
import matplotlib.pyplot as plt
from collections import defaultdict
from backend.estimator import estimate_eco_impact

# Load products
with open("tests/sample_data.json") as f:
    products = json.load(f)

# --- Aggregate by category ---
category_carbon = defaultdict(list)
category_scores = defaultdict(list)

for p in products:
    carbon, score = estimate_eco_impact(p)
    category_carbon[p["category"]].append(carbon)
    category_scores[p["category"]].append(score)

# Calculate averages
avg_carbon = {cat: sum(vals)/len(vals) for cat, vals in category_carbon.items()}
avg_scores = {cat: sum(vals)/len(vals) for cat, vals in category_scores.items()}

# --- Plot 1: Average carbon footprint per category ---
plt.figure(figsize=(8, 6))
plt.bar(avg_carbon.keys(), avg_carbon.values())
plt.ylabel("Avg Carbon Footprint (kg CO₂)")
plt.title("Average Carbon Footprint by Category")
plt.xticks(rotation=30, ha="right")
plt.tight_layout()
plt.savefig("tests/avg_carbon_by_category.png")
plt.show()

# --- Plot 2: Average sustainability score per category ---
plt.figure(figsize=(8, 6))
plt.bar(avg_scores.keys(), avg_scores.values(), color="green")
plt.ylabel("Avg Sustainability Score")
plt.title("Average Sustainability Score by Category")
plt.xticks(rotation=30, ha="right")
plt.tight_layout()
plt.savefig("tests/avg_score_by_category.png")
plt.show()
