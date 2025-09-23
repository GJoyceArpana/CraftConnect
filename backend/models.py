from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    weight_g = db.Column(db.Float, nullable=False)
    materials = db.Column(db.String(200), nullable=True)
    percent_recycled_material = db.Column(db.Float, nullable=False)
    production_method = db.Column(db.String(50), nullable=False)
    distance_km_to_market = db.Column(db.Float, nullable=False)
    packaging_weight_g = db.Column(db.Float, nullable=False)
    co2_saving_kg = db.Column(db.Float, nullable=True)
    waste_reduction_pct = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "weight_g": self.weight_g,
            "materials": self.materials,
            "percent_recycled_material": self.percent_recycled_material,
            "production_method": self.production_method,
            "distance_km_to_market": self.distance_km_to_market,
            "packaging_weight_g": self.packaging_weight_g,
            "co2_saving_kg": self.co2_saving_kg,
            "waste_reduction_pct": self.waste_reduction_pct,
        }
