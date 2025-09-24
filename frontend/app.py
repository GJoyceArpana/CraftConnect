# import streamlit as st
# import requests

# # Backend URL
# API_URL = "http://127.0.0.1:5000"

# st.title("🌱 Eco Impact Calculator")

# # --- Form to add a product ---
# st.header("Add a Product")

# with st.form("product_form"):
#     name = st.text_input("Product Name")
#     category = st.selectbox("Category", ["textiles", "terracotta pottery", "bamboo products", "toys", "painting and decorative arts"])
#     weight_g = st.number_input("Weight (g)", min_value=1, step=10)
#     materials = st.text_input("Materials (e.g. cotton, bamboo)")
#     recycled = st.slider("Percent Recycled Material", 0, 100, 10)
#     method = st.selectbox("Production Method", ["handmade", "machine"])
#     distance = st.number_input("Distance to Market (km)", min_value=0, step=10)
#     packaging = st.number_input("Packaging Weight (g)", min_value=0, step=5)

#     submitted = st.form_submit_button("Save Product")

#     if submitted:
#         product = {
#             "name": name,
#             "category": category,
#             "weight_g": weight_g,
#             "materials": materials,
#             "percent_recycled_material": recycled,
#             "production_method": method,
#             "distance_km_to_market": distance,
#             "packaging_weight_g": packaging
#         }
#         res = requests.post(f"{API_URL}/products", json=product)
#         if res.status_code == 201:
#             st.success("✅ Product saved successfully!")
#         else:
#             st.error("❌ Failed to save product")

# # --- Section: List products ---
# st.header("Saved Products")
# res = requests.get(f"{API_URL}/products")
# if res.ok:
#     products = res.json()
#     for p in products:
#         st.write(p)
# else:
#     st.error("Could not load products")

# # --- Section: Predict eco impact ---
# st.header("Predict Eco Impact")
# if st.button("Run Prediction on Last Product"):
#     if products:
#         last_product = products[-1]
#         res = requests.post(f"{API_URL}/predict", json=last_product)
#         if res.ok:
#             result = res.json()
#             st.metric("🌍 Carbon Footprint (kg CO₂)", result["carbon_footprint"])
#             st.metric("♻️ Sustainability Score", result["sustainability_score"])
#         else:
#             st.error("Prediction failed")
#     else:
#         st.warning("No products available")

import streamlit as st
import requests

# Backend URL
API_URL = "http://127.0.0.1:5000"

st.title("🌱 Eco Impact Calculator")

# --- Form to add a product ---
st.header("Add a Product")

with st.form("product_form"):
    name = st.text_input("Product Name")
    category = st.selectbox("Category", ["textiles", "terracotta pottery", "bamboo products", "toys", "painting and decorative arts"])
    weight_g = st.number_input("Weight (g)", min_value=1, step=10)
    materials = st.text_input("Materials (e.g. cotton, bamboo)")
    recycled = st.slider("Percent Recycled Material", 0, 100, 10)
    method = st.selectbox("Production Method", ["handmade", "machine"])
    distance = st.number_input("Distance to Market (km)", min_value=0, step=10)
    packaging = st.number_input("Packaging Weight (g)", min_value=0, step=5)

    submitted = st.form_submit_button("Save & Calculate")

    if submitted:
        # Create product dict
        product = {
            "name": name,
            "category": category,
            "weight_g": weight_g,
            "materials": materials,
            "percent_recycled_material": recycled,
            "production_method": method,
            "distance_km_to_market": distance,
            "packaging_weight_g": packaging
        }

        # 1. Save product to JSON file (via backend)
        save_res = requests.post(f"{API_URL}/products", json=product)

        # 2. Get eco impact only for this product
        predict_res = requests.post(f"{API_URL}/predict", json=product)

        if save_res.status_code == 201 and predict_res.ok:
            result = predict_res.json()
            st.success(f"✅ Product '{name}' saved successfully!")
            
            # Show only this product's results
            st.subheader("Eco Impact for Current Product")
            st.metric("🌍 Carbon Footprint (kg CO₂)", result["carbon_footprint"])
            st.metric("♻️ Sustainability Score", result["sustainability_score"])
        else:
            st.error("❌ Failed to save or predict eco impact")
