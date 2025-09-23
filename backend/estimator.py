category_factors = {
    "textiles": {"factory": 5.0, "handmade_mult": 0.5},
    "terracotta": {"factory": 3.0, "handmade_mult": 1.0},
    "bamboo": {"factory": 2.5, "handmade_mult": 0.8},
    "toys": {"factory": 4.0, "handmade_mult": 0.7},
    "painting": {"factory": 1.5, "handmade_mult": 0.5},
}

def estimate_eco_impact(product):
    """
    Calculate environmental impact metrics for a craft product.
    
    Args:
        product (dict): Product data containing:
            - weight_g: Product weight in grams
            - packaging_weight_g: Packaging weight in grams
            - distance_km_to_market: Transportation distance in km
            - category: Product category
            - percent_recycled_material: Percentage of recycled materials used
            - production_method: Production method (handmade, small-batch, etc.)
    
    Returns:
        tuple: (co2_saving_kg, waste_reduction_pct)
    """
    # Convert weights to kg
    weight_kg = product["weight_g"] / 1000
    packaging_kg = product["packaging_weight_g"] / 1000
    distance_km = product["distance_km_to_market"]

    # Category multipliers based on production complexity and materials
    factors = category_factors.get(product["category"], {"factory": 3.0, "handmade_mult": 0.8})

    # Factory CO₂ calculation (mass production baseline)
    factory_co2 = (weight_kg + packaging_kg) * factors["factory"] + (0.001 * distance_km)

    # Artisan CO₂ calculation (handcraft production)
    artisan_co2 = (weight_kg + packaging_kg) * (factors["factory"] * factors["handmade_mult"]) + (0.001 * distance_km * 0.5)

    # CO₂ savings compared to mass production
    co2_saving = max(factory_co2 - artisan_co2, 0)

    # Waste reduction percentage calculation
    waste_reduction_pct = product["percent_recycled_material"] * 0.5
    
    # Production method bonuses
    if product["production_method"] == "handmade":
        waste_reduction_pct += 20
    elif product["production_method"] == "small-batch":
        waste_reduction_pct += 10

    # Cap waste reduction at 90%
    waste_reduction_pct = min(waste_reduction_pct, 90)

    return round(co2_saving, 2), round(waste_reduction_pct, 1)