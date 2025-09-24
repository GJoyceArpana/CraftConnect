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

    # Enhanced CO₂ calculation with more weight on distance and production method
    base_material_impact = (weight_kg + packaging_kg) * factors["factory"]
    transport_impact = 0.01 * distance_km  # Increased transport impact
    
    # Factory CO₂ (higher base impact)
    factory_co2 = base_material_impact + transport_impact

    # Artisan/sustainable CO₂ (varies more by production method)
    production_multiplier = {
        "handmade": factors["handmade_mult"],
        "small-batch": 0.7,  # Between handmade and factory
        "factory": 1.0
    }.get(product["production_method"], 0.8)
    
    artisan_co2 = (base_material_impact * production_multiplier) + (transport_impact * 0.3)
    co2_saving = max(factory_co2 - artisan_co2, 0)

    # Enhanced sustainability score calculation
    base_sustainability = product["percent_recycled_material"] * 0.4  # Recycled materials impact
    
    # Production method bonus (more significant differences)
    if product["production_method"] == "handmade":
        method_bonus = 35
    elif product["production_method"] == "small-batch":
        method_bonus = 20
    else:
        method_bonus = 0
    
    # Distance penalty (longer distances = less sustainable)
    distance_penalty = min(distance_km * 0.05, 25)  # Max 25% penalty
    
    # Weight penalty (heavier items = less sustainable)
    weight_penalty = min((weight_kg + packaging_kg) * 8, 15)  # Max 15% penalty
    
    sustainability_score = base_sustainability + method_bonus - distance_penalty - weight_penalty
    sustainability_score = max(0, min(sustainability_score, 95))  # Cap between 0-95%

    return round(co2_saving, 2), round(sustainability_score, 1)
