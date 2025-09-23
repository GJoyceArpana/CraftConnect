category_factors = {
    "textiles": {"factory": 5.0, "handmade_mult": 0.5},
    "terracotta": {"factory": 3.0, "handmade_mult": 1.0},
    "bamboo": {"factory": 2.5, "handmade_mult": 0.8},
    "toys": {"factory": 4.0, "handmade_mult": 0.7},
    "painting": {"factory": 1.5, "handmade_mult": 0.5},
}

def estimate_eco_impact(product):
    # Convert weights
    weight_kg = product["weight_g"] / 1000
    packaging_kg = product["packaging_weight_g"] / 1000
    distance_km = product["distance_km_to_market"]

    # Category multipliers
    factors = category_factors.get(product["category"], {"factory": 3.0, "handmade_mult": 0.8})

    # Factory CO₂
    factory_co2 = (weight_kg + packaging_kg) * factors["factory"] + (0.001 * distance_km)

    # Artisan CO₂
    artisan_co2 = (weight_kg + packaging_kg) * (factors["factory"] * factors["handmade_mult"]) + (0.001 * distance_km * 0.5)

    co2_saving = max(factory_co2 - artisan_co2, 0)

    # Waste reduction %
    waste_reduction_pct = product["percent_recycled_material"] * 0.5
    if product["production_method"] == "handmade":
        waste_reduction_pct += 20
    elif product["production_method"] == "small-batch":
        waste_reduction_pct += 10

    waste_reduction_pct = min(waste_reduction_pct, 90)

    return round(co2_saving, 2), round(waste_reduction_pct, 1)
