import json
from openpyxl import Workbook
from backend.estimator import estimate_eco_impact

# Load all products
with open("tests/sample_data.json") as f:
    products = json.load(f)

# Create a new Excel workbook
wb = Workbook()
ws = wb.active
ws.title = "Eco Impact Results"

# Write header row (bold)
headers = ["Name", "Category", "Carbon_Footprint (kgCO2)", "Sustainability_Score"]
ws.append(headers)

# Write each product’s results
for p in products:
    carbon, score = estimate_eco_impact(p)
    ws.append([p["name"], p["category"], carbon, score])

# Save Excel file
wb.save("tests/results.xlsx")

print("✅ Results saved to tests/results.xlsx")
