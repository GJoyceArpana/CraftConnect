"""
Price Prediction Service
Provides price range suggestions for craft products using CatBoost ML model
"""

import os
import pandas as pd
from typing import Dict, List, Tuple, Optional

try:
    from catboost import CatBoostRegressor
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
    print("Warning: CatBoost not available. Price prediction functionality will be disabled.")

class PricePredictionService:
    def __init__(self, model_path: str = "catboost_craft_price.cbm"):
        self.model = None
        self.model_path = model_path
        self.is_loaded = False
        
        if CATBOOST_AVAILABLE:
            self._load_model()
    
    def _load_model(self):
        """Load the trained CatBoost model"""
        try:
            if os.path.exists(self.model_path):
                self.model = CatBoostRegressor()
                self.model.load_model(self.model_path)
                self.is_loaded = True
                print("Price prediction model loaded successfully")
            else:
                print(f"Model file not found at {self.model_path}")
        except Exception as e:
            print(f"Error loading price prediction model: {e}")
    
    def predict_price(self, product_data: Dict) -> Optional[Dict]:
        """
        Predict price for a craft product
        
        Args:
            product_data: Dictionary containing product features:
                - base_material_price: float
                - dimensions: float
                - hours_of_labor: float
                - transport_distance: float
                - region: str
                - category: str
                - crafting_process: str
        
        Returns:
            Dictionary with predicted_price and price_range, or None if prediction fails
        """
        if not self.is_loaded or not CATBOOST_AVAILABLE:
            return None
        
        try:
            # Expected feature columns in order
            feature_cols = [
                'Base Material Price', 
                'Dimensions', 
                'Hours of Labor', 
                'Transport Distance',
                'Region', 
                'Category', 
                'Crafting Process'
            ]
            
            # Map input data to expected format
            input_data = {
                'Base Material Price': product_data.get('base_material_price', 0),
                'Dimensions': product_data.get('dimensions', 0),
                'Hours of Labor': product_data.get('hours_of_labor', 0),
                'Transport Distance': product_data.get('transport_distance', 0),
                'Region': product_data.get('region', 'Unknown'),
                'Category': product_data.get('category', 'Unknown'),
                'Crafting Process': product_data.get('crafting_process', 'Unknown')
            }
            
            # Convert to DataFrame
            df_input = pd.DataFrame([input_data])
            df_input = df_input[feature_cols]
            
            # Predict price
            prediction = self.model.predict(df_input)[0]
            
            # Calculate price range (±10%)
            price_min, price_max = self._calculate_price_range(prediction)
            
            return {
                "predicted_price": round(prediction, 2),
                "price_range": {
                    "min": price_min,
                    "max": price_max
                },
                "confidence": "medium"  # Could be enhanced with actual confidence metrics
            }
            
        except Exception as e:
            print(f"Error predicting price: {e}")
            return None
    
    def _calculate_price_range(self, predicted_price: float, margin: float = 0.1) -> Tuple[float, float]:
        """Calculate price range with given margin"""
        price_min = round(predicted_price * (1 - margin), 2)
        price_max = round(predicted_price * (1 + margin), 2)
        return price_min, price_max
    
    def get_price_suggestions(self, base_price: float, product_data: Dict) -> Dict:
        """
        Get comprehensive price suggestions including ML prediction and market analysis
        """
        suggestions = {
            "base_price": base_price,
            "suggestions": []
        }
        
        # ML-based prediction
        ml_prediction = self.predict_price(product_data)
        if ml_prediction:
            suggestions["suggestions"].append({
                "type": "ml_prediction",
                "name": "AI Price Suggestion",
                "price": ml_prediction["predicted_price"],
                "range": ml_prediction["price_range"],
                "confidence": ml_prediction["confidence"],
                "reasoning": "Based on machine learning analysis of similar products"
            })
        
        # Rule-based suggestions (fallback)
        category = product_data.get('category', '').lower()
        labor_hours = product_data.get('hours_of_labor', 0)
        
        # Labor-based pricing
        if labor_hours > 0:
            labor_rate = 15  # $15 per hour base rate
            labor_price = labor_rate * labor_hours
            material_markup = base_price * 1.3  # 30% markup on materials
            labor_based_price = labor_price + material_markup
            
            suggestions["suggestions"].append({
                "type": "labor_based",
                "name": "Labor + Materials",
                "price": round(labor_based_price, 2),
                "range": {
                    "min": round(labor_based_price * 0.9, 2),
                    "max": round(labor_based_price * 1.1, 2)
                },
                "confidence": "high",
                "reasoning": f"${labor_rate}/hour × {labor_hours} hours + materials markup"
            })
        
        # Category-based markup
        category_multipliers = {
            'jewelry': 2.5,
            'pottery': 2.0,
            'textiles': 2.2,
            'woodwork': 1.8,
            'metalwork': 2.3,
            'glass': 2.4
        }
        
        multiplier = category_multipliers.get(category, 2.0)
        category_price = base_price * multiplier
        
        suggestions["suggestions"].append({
            "type": "category_based",
            "name": f"Market Rate ({category.title()})",
            "price": round(category_price, 2),
            "range": {
                "min": round(category_price * 0.85, 2),
                "max": round(category_price * 1.15, 2)
            },
            "confidence": "medium",
            "reasoning": f"Typical {multiplier}x markup for {category} category"
        })
        
        return suggestions

# Global instance
price_service = PricePredictionService()