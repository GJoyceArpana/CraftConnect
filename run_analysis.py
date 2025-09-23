import json
import csv
from backend.estimator import estimate_eco_impact

# Load all products from JSON
with open("tests/sample_data.json") as f:
    products = json.load(f)

# Open CSV file to save results
with open("tests/results.csv", "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    # Header row
    writer.writerow(["Name", "Category", "Carbon_Footprint (kgCO2)", "Sustainability_Score"])

    # Process each product
    for p in products:
        carbon, score = estimate_eco_impact(p)
        writer.writerow([p["name"], p["category"], carbon, score])

print("✅ Results saved to tests/results.csv")
