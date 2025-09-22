#!/usr/bin/env python3
"""
Advanced ML Models for CraftConnect
Integrates CLIP, MobileNet, XGBoost and other advanced models
"""

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
import logging
import joblib
from pathlib import Path
import json
import base64
import io

# Advanced ML imports
try:
    import clip
    import cv2
    from sentence_transformers import SentenceTransformer
    from transformers import pipeline
    import xgboost as xgb
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    ADVANCED_ML_AVAILABLE = True
except ImportError as e:
    ADVANCED_ML_AVAILABLE = False
    print(f"Advanced ML libraries not available: {e}")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedAutoTagger:
    """Advanced auto-tagging using CLIP and other state-of-the-art models"""
    
    def __init__(self):
        self.models = {}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Model paths
        self.model_dir = Path("models")
        self.model_dir.mkdir(exist_ok=True)
        
        # Indian craft categories for CLIP
        self.craft_categories = [
            "madhubani painting", "warli art", "dhokra sculpture", "chikankari embroidery",
            "bandhani tie dye", "blue pottery", "kantha embroidery", "phulkari embroidery",
            "block print textile", "handwoven fabric", "brass metalwork", "silver jewelry",
            "wooden carving", "stone sculpture", "terracotta pottery", "bamboo craft",
            "jute handicraft", "coconut craft", "palm leaf art", "organic textile"
        ]
        
        # Sustainability keywords for CLIP
        self.sustainability_keywords = [
            "organic materials", "recycled materials", "natural dyes", "handmade craft",
            "eco friendly", "sustainable production", "zero waste", "biodegradable",
            "fair trade", "locally sourced", "traditional methods", "renewable materials"
        ]
        
        self.init_models()
    
    def init_models(self):
        """Initialize all ML models"""
        if not ADVANCED_ML_AVAILABLE:
            logger.warning("Advanced ML not available, using fallback methods")
            return
        
        try:
            # Initialize CLIP model
            logger.info("Loading CLIP model...")
            self.models['clip_model'], self.models['clip_preprocess'] = clip.load("ViT-B/32", device=self.device)
            
            # Initialize sentence transformer for text similarity
            logger.info("Loading sentence transformer...")
            self.models['sentence_transformer'] = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize image classification pipeline
            logger.info("Loading image classification pipeline...")
            self.models['image_classifier'] = pipeline(
                "image-classification", 
                model="google/mobilenet_v2_1.0_224",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Pre-encode category and sustainability text
            self.encode_text_features()
            
            logger.info("All models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            ADVANCED_ML_AVAILABLE = False
    
    def encode_text_features(self):
        """Pre-encode text features for faster inference"""
        if 'clip_model' in self.models:
            # Encode craft categories
            category_texts = clip.tokenize(self.craft_categories).to(self.device)
            with torch.no_grad():
                self.models['category_features'] = self.models['clip_model'].encode_text(category_texts)
            
            # Encode sustainability keywords
            sustainability_texts = clip.tokenize(self.sustainability_keywords).to(self.device)
            with torch.no_grad():
                self.models['sustainability_features'] = self.models['clip_model'].encode_text(sustainability_texts)
    
    def analyze_image_clip(self, image_path: str) -> Dict[str, Any]:
        """Analyze image using CLIP model"""
        if not ADVANCED_ML_AVAILABLE or 'clip_model' not in self.models:
            return self.fallback_image_analysis(image_path)
        
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_input = self.models['clip_preprocess'](image).unsqueeze(0).to(self.device)
            
            # Encode image
            with torch.no_grad():
                image_features = self.models['clip_model'].encode_image(image_input)
            
            # Calculate similarities with categories
            category_similarities = torch.cosine_similarity(
                image_features, self.models['category_features']
            ).cpu().numpy()
            
            # Calculate similarities with sustainability features
            sustainability_similarities = torch.cosine_similarity(
                image_features, self.models['sustainability_features']
            ).cpu().numpy()
            
            # Get top predictions
            top_categories = self.get_top_predictions(
                category_similarities, self.craft_categories, top_k=5
            )
            
            top_sustainability = self.get_top_predictions(
                sustainability_similarities, self.sustainability_keywords, top_k=3
            )
            
            return {
                'categories': top_categories,
                'sustainability_features': top_sustainability,
                'analysis_method': 'CLIP',
                'confidence': float(np.mean(category_similarities))
            }
            
        except Exception as e:
            logger.error(f"CLIP analysis failed: {e}")
            return self.fallback_image_analysis(image_path)
    
    def get_top_predictions(self, similarities: np.ndarray, labels: List[str], top_k: int = 5) -> List[Dict]:
        """Get top predictions with confidence scores"""
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [
            {
                'label': labels[idx],
                'confidence': float(similarities[idx]),
                'score': float(similarities[idx])
            }
            for idx in top_indices if similarities[idx] > 0.1  # Filter low confidence
        ]
    
    def analyze_image_mobilenet(self, image_path: str) -> Dict[str, Any]:
        """Analyze image using MobileNet"""
        if not ADVANCED_ML_AVAILABLE or 'image_classifier' not in self.models:
            return self.fallback_image_analysis(image_path)
        
        try:
            image = Image.open(image_path).convert('RGB')
            predictions = self.models['image_classifier'](image, top_k=10)
            
            # Map ImageNet labels to craft categories
            craft_predictions = self.map_imagenet_to_crafts(predictions)
            
            return {
                'predictions': craft_predictions,
                'analysis_method': 'MobileNet',
                'raw_predictions': predictions[:5]  # Top 5 raw predictions
            }
            
        except Exception as e:
            logger.error(f"MobileNet analysis failed: {e}")
            return self.fallback_image_analysis(image_path)
    
    def map_imagenet_to_crafts(self, predictions: List[Dict]) -> List[Dict]:
        """Map ImageNet classifications to Indian craft categories"""
        craft_mappings = {
            # Textiles
            'fabric': ['textiles', 'fabric', 'cloth'],
            'clothing': ['textiles', 'apparel', 'garment'],
            'scarf': ['textiles', 'dupatta', 'shawl'],
            
            # Pottery & Ceramics
            'pottery': ['pottery', 'ceramic', 'clay'],
            'vase': ['pottery', 'decorative', 'vessel'],
            'bowl': ['pottery', 'kitchen', 'tableware'],
            
            # Jewelry & Metalwork
            'jewelry': ['jewelry', 'ornament', 'accessory'],
            'necklace': ['jewelry', 'necklace', 'chain'],
            'bracelet': ['jewelry', 'bangle', 'bracelet'],
            
            # Wood & Bamboo
            'wood': ['woodwork', 'carving', 'furniture'],
            'furniture': ['woodwork', 'furniture', 'home-decor'],
            'basket': ['bamboo', 'weaving', 'storage'],
        }
        
        craft_predictions = []
        for pred in predictions:
            label = pred['label'].lower()
            for craft_key, craft_tags in craft_mappings.items():
                if craft_key in label or any(tag in label for tag in craft_tags):
                    craft_predictions.append({
                        'craft_category': craft_key,
                        'confidence': pred['score'],
                        'original_label': pred['label']
                    })
                    break
        
        return craft_predictions[:5]  # Top 5 craft predictions
    
    def fallback_image_analysis(self, image_path: str) -> Dict[str, Any]:
        """Fallback image analysis using traditional CV"""
        try:
            # Use OpenCV for basic image analysis
            image = cv2.imread(image_path)
            if image is None:
                return {'error': 'Could not load image'}
            
            # Basic color analysis
            colors = self.analyze_dominant_colors(image)
            
            # Basic texture analysis
            texture = self.analyze_texture(image)
            
            return {
                'analysis_method': 'OpenCV_Fallback',
                'colors': colors,
                'texture': texture,
                'message': 'Advanced ML models not available, using basic analysis'
            }
            
        except Exception as e:
            logger.error(f"Fallback analysis failed: {e}")
            return {'error': str(e)}
    
    def analyze_dominant_colors(self, image: np.ndarray) -> List[Dict]:
        """Extract dominant colors from image"""
        # Convert to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Reshape for k-means
        data = image_rgb.reshape(-1, 3)
        
        # Use k-means clustering (simplified version)
        from sklearn.cluster import KMeans
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        kmeans.fit(data)
        
        colors = []
        for i, color in enumerate(kmeans.cluster_centers_):
            colors.append({
                'rgb': [int(c) for c in color],
                'percentage': float(np.sum(kmeans.labels_ == i) / len(kmeans.labels_))
            })
        
        return sorted(colors, key=lambda x: x['percentage'], reverse=True)
    
    def analyze_texture(self, image: np.ndarray) -> Dict:
        """Basic texture analysis"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Calculate texture metrics
        return {
            'mean_intensity': float(np.mean(gray)),
            'std_intensity': float(np.std(gray)),
            'contrast': float(np.max(gray) - np.min(gray))
        }

class AdvancedPricingModel:
    """Advanced pricing model using XGBoost and ensemble methods"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.model_dir = Path("models/pricing")
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.init_pricing_models()
    
    def init_pricing_models(self):
        """Initialize pricing models"""
        try:
            # Try to load pre-trained models
            self.load_models()
        except:
            # Train new models if none exist
            logger.info("Training new pricing models...")
            self.train_models()
    
    def train_models(self):
        """Train pricing models on Indian craft data"""
        # Generate sample training data for Indian crafts
        training_data = self.generate_training_data()
        
        if training_data.empty:
            logger.warning("No training data available")
            return
        
        # Prepare features
        X, y = self.prepare_features(training_data)
        
        # Train XGBoost model
        self.models['xgboost'] = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        self.models['xgboost'].fit(X, y)
        
        # Train Random Forest as backup
        self.models['random_forest'] = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )
        self.models['random_forest'].fit(X, y)
        
        # Save models
        self.save_models()
        
        logger.info("Pricing models trained successfully!")
    
    def generate_training_data(self) -> pd.DataFrame:
        """Generate synthetic training data for Indian crafts"""
        # This would typically come from your database
        # For demo, creating synthetic data
        
        data = []
        craft_types = [
            'madhubani_painting', 'chikankari_kurta', 'dhokra_sculpture',
            'bandhani_dupatta', 'blue_pottery', 'kantha_bedcover',
            'phulkari_shawl', 'block_print_saree', 'brass_lamp',
            'wooden_carving', 'jute_bag', 'bamboo_basket'
        ]
        
        regions = [
            'bihar', 'uttar_pradesh', 'chhattisgarh', 'gujarat',
            'rajasthan', 'west_bengal', 'punjab', 'delhi',
            'karnataka', 'kerala', 'odisha', 'maharashtra'
        ]
        
        for _ in range(1000):  # Generate 1000 samples
            craft = np.random.choice(craft_types)
            region = np.random.choice(regions)
            
            # Base price factors
            base_price = np.random.uniform(500, 5000)
            
            # Adjust based on craft type
            craft_multipliers = {
                'madhubani_painting': 1.2, 'dhokra_sculpture': 1.5,
                'chikankari_kurta': 0.8, 'blue_pottery': 0.7,
                'phulkari_shawl': 1.3, 'block_print_saree': 1.1
            }
            
            multiplier = craft_multipliers.get(craft, 1.0)
            price = base_price * multiplier
            
            # Add features
            data.append({
                'craft_type': craft,
                'region': region,
                'material_quality': np.random.uniform(0.5, 1.0),
                'artisan_experience': np.random.randint(1, 30),
                'size_factor': np.random.uniform(0.5, 2.0),
                'sustainability_score': np.random.uniform(0.3, 1.0),
                'complexity_score': np.random.uniform(0.4, 1.0),
                'market_demand': np.random.uniform(0.3, 1.0),
                'price': price
            })
        
        return pd.DataFrame(data)
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for training"""
        # Encode categorical variables
        self.encoders['craft_type'] = LabelEncoder()
        self.encoders['region'] = LabelEncoder()
        
        data['craft_type_encoded'] = self.encoders['craft_type'].fit_transform(data['craft_type'])
        data['region_encoded'] = self.encoders['region'].fit_transform(data['region'])
        
        # Select features
        feature_columns = [
            'craft_type_encoded', 'region_encoded', 'material_quality',
            'artisan_experience', 'size_factor', 'sustainability_score',
            'complexity_score', 'market_demand'
        ]
        
        X = data[feature_columns].values
        y = data['price'].values
        
        # Scale features
        self.scalers['features'] = StandardScaler()
        X_scaled = self.scalers['features'].fit_transform(X)
        
        return X_scaled, y
    
    def predict_price(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict price using ensemble of models"""
        try:
            # Prepare features
            feature_vector = self.encode_features(features)
            
            # Get predictions from both models
            predictions = {}
            if 'xgboost' in self.models:
                predictions['xgboost'] = self.models['xgboost'].predict([feature_vector])[0]
            
            if 'random_forest' in self.models:
                predictions['random_forest'] = self.models['random_forest'].predict([feature_vector])[0]
            
            # Ensemble prediction (average)
            if predictions:
                final_price = np.mean(list(predictions.values()))
                confidence = min(0.95, max(0.6, 1.0 - np.std(list(predictions.values())) / np.mean(list(predictions.values()))))
            else:
                # Fallback pricing
                final_price = self.fallback_pricing(features)
                confidence = 0.5
            
            return {
                'predicted_price': float(final_price),
                'confidence': float(confidence),
                'price_range': {
                    'min': float(final_price * 0.8),
                    'max': float(final_price * 1.2)
                },
                'individual_predictions': predictions
            }
            
        except Exception as e:
            logger.error(f"Price prediction failed: {e}")
            return {
                'predicted_price': self.fallback_pricing(features),
                'confidence': 0.3,
                'error': str(e)
            }
    
    def encode_features(self, features: Dict[str, Any]) -> np.ndarray:
        """Encode features for prediction"""
        # Default values
        encoded = np.zeros(8)  # 8 features
        
        # Encode craft type
        craft_type = features.get('craft_type', 'unknown')
        if hasattr(self.encoders.get('craft_type'), 'classes_'):
            if craft_type in self.encoders['craft_type'].classes_:
                encoded[0] = self.encoders['craft_type'].transform([craft_type])[0]
        
        # Encode region
        region = features.get('region', 'unknown')
        if hasattr(self.encoders.get('region'), 'classes_'):
            if region in self.encoders['region'].classes_:
                encoded[1] = self.encoders['region'].transform([region])[0]
        
        # Other features
        encoded[2] = features.get('material_quality', 0.7)
        encoded[3] = features.get('artisan_experience', 5)
        encoded[4] = features.get('size_factor', 1.0)
        encoded[5] = features.get('sustainability_score', 0.6)
        encoded[6] = features.get('complexity_score', 0.7)
        encoded[7] = features.get('market_demand', 0.6)
        
        # Scale features
        if 'features' in self.scalers:
            encoded = self.scalers['features'].transform([encoded])[0]
        
        return encoded
    
    def fallback_pricing(self, features: Dict[str, Any]) -> float:
        """Fallback pricing logic"""
        base_price = 1000  # Base price in INR
        
        # Adjust based on craft type
        craft_multipliers = {
            'painting': 1.5, 'textile': 1.2, 'sculpture': 2.0,
            'pottery': 0.8, 'jewelry': 1.8, 'woodwork': 1.3
        }
        
        craft_type = features.get('craft_type', '')
        multiplier = 1.0
        
        for craft, mult in craft_multipliers.items():
            if craft in craft_type.lower():
                multiplier = mult
                break
        
        # Apply sustainability bonus
        sustainability_bonus = features.get('sustainability_score', 0.5) * 0.3
        
        final_price = base_price * multiplier * (1 + sustainability_bonus)
        return float(final_price)
    
    def save_models(self):
        """Save trained models"""
        try:
            for name, model in self.models.items():
                joblib.dump(model, self.model_dir / f"{name}_model.pkl")
            
            for name, scaler in self.scalers.items():
                joblib.dump(scaler, self.model_dir / f"{name}_scaler.pkl")
            
            for name, encoder in self.encoders.items():
                joblib.dump(encoder, self.model_dir / f"{name}_encoder.pkl")
                
            logger.info("Models saved successfully!")
        except Exception as e:
            logger.error(f"Failed to save models: {e}")
    
    def load_models(self):
        """Load pre-trained models"""
        model_files = {
            'xgboost': 'xgboost_model.pkl',
            'random_forest': 'random_forest_model.pkl'
        }
        
        for name, filename in model_files.items():
            path = self.model_dir / filename
            if path.exists():
                self.models[name] = joblib.load(path)
        
        # Load scalers and encoders
        for prefix in ['features']:
            path = self.model_dir / f"{prefix}_scaler.pkl"
            if path.exists():
                self.scalers[prefix] = joblib.load(path)
        
        for prefix in ['craft_type', 'region']:
            path = self.model_dir / f"{prefix}_encoder.pkl"
            if path.exists():
                self.encoders[prefix] = joblib.load(path)

class SustainabilityAnalyzer:
    """Advanced sustainability analysis with CO2 and waste impact calculation"""
    
    def __init__(self):
        # CO2 emission factors (kg CO2 per kg of material)
        self.co2_factors = {
            # Natural/Organic materials (low emission)
            'organic_cotton': 2.1,
            'hemp': 1.2,
            'bamboo': 0.8,
            'jute': 0.9,
            'linen': 1.8,
            'wool': 5.0,
            'silk': 2.5,
            'coir': 0.7,
            
            # Recycled materials (very low emission)
            'recycled_cotton': 0.5,
            'recycled_paper': 0.3,
            'recycled_plastic': 1.2,
            'recycled_metal': 0.8,
            
            # Traditional materials
            'clay': 0.2,
            'wood': 0.4,
            'stone': 0.1,
            'brass': 2.8,
            'copper': 3.5,
            'silver': 8.2,
            
            # Synthetic materials (high emission)
            'polyester': 5.9,
            'nylon': 7.6,
            'acrylic': 4.2
        }
        
        # Waste impact factors (waste generation per unit)
        self.waste_factors = {
            'traditional_methods': 0.1,  # Very low waste
            'handmade': 0.2,
            'machine_made': 0.8,
            'mass_production': 1.5
        }
    
    def analyze_sustainability(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive sustainability analysis"""
        
        # Extract materials
        materials = self.extract_materials(product_data)
        
        # Calculate CO2 impact
        co2_analysis = self.calculate_co2_impact(materials, product_data)
        
        # Calculate waste impact
        waste_analysis = self.calculate_waste_impact(product_data)
        
        # Overall sustainability score
        overall_score = self.calculate_overall_score(co2_analysis, waste_analysis, product_data)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(co2_analysis, waste_analysis, product_data)
        
        return {
            'co2_analysis': co2_analysis,
            'waste_analysis': waste_analysis,
            'overall_sustainability_score': overall_score,
            'sustainability_grade': self.get_grade(overall_score),
            'recommendations': recommendations,
            'certification_eligible': overall_score > 0.7
        }
    
    def extract_materials(self, product_data: Dict[str, Any]) -> List[str]:
        """Extract and normalize material names"""
        materials = []
        
        # From materials field
        if 'materials' in product_data:
            if isinstance(product_data['materials'], list):
                materials.extend(product_data['materials'])
            else:
                materials.extend(str(product_data['materials']).split(','))
        
        # From description
        description = product_data.get('description', '').lower()
        for material in self.co2_factors.keys():
            if material.replace('_', ' ') in description:
                materials.append(material)
        
        return [m.strip().lower().replace(' ', '_') for m in materials]
    
    def calculate_co2_impact(self, materials: List[str], product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate CO2 impact of materials"""
        
        total_co2 = 0
        material_impacts = {}
        
        # Estimate weight (this would come from actual product data)
        estimated_weight = self.estimate_weight(product_data)
        
        for material in materials:
            co2_factor = self.co2_factors.get(material, 3.0)  # Default factor
            material_co2 = co2_factor * estimated_weight
            total_co2 += material_co2
            material_impacts[material] = material_co2
        
        # Transportation factor (local vs imported)
        transport_factor = self.get_transport_factor(product_data)
        total_co2 *= transport_factor
        
        return {
            'total_co2_kg': round(total_co2, 2),
            'co2_per_kg': round(total_co2 / max(estimated_weight, 0.1), 2),
            'material_breakdown': material_impacts,
            'transport_factor': transport_factor,
            'carbon_category': self.categorize_carbon_impact(total_co2)
        }
    
    def calculate_waste_impact(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate waste impact"""
        
        base_waste = 1.0  # Base waste factor
        
        # Production method factor
        description = product_data.get('description', '').lower()
        method_factor = 1.0
        
        for method, factor in self.waste_factors.items():
            if method.replace('_', ' ') in description:
                method_factor = factor
                break
        
        # Material efficiency
        materials = self.extract_materials(product_data)
        efficiency_bonus = 0
        
        for material in materials:
            if 'recycled' in material:
                efficiency_bonus += 0.3
            elif 'organic' in material or 'natural' in material:
                efficiency_bonus += 0.2
        
        total_waste = base_waste * method_factor * (1 - min(efficiency_bonus, 0.8))
        
        return {
            'waste_score': round(1 - total_waste, 2),  # Higher is better
            'method_factor': method_factor,
            'efficiency_bonus': efficiency_bonus,
            'waste_category': self.categorize_waste_impact(total_waste)
        }
    
    def calculate_overall_score(self, co2_analysis: Dict, waste_analysis: Dict, product_data: Dict) -> float:
        """Calculate overall sustainability score (0-1)"""
        
        # CO2 impact (inverse - lower is better)
        co2_score = max(0, 1 - (co2_analysis['total_co2_kg'] / 10))  # Normalize by 10kg
        
        # Waste score (higher is better)
        waste_score = waste_analysis['waste_score']
        
        # Additional factors
        bonus_factors = 0
        description = product_data.get('description', '').lower()
        
        # Sustainability keywords bonus
        sustainability_keywords = [
            'fair trade', 'locally sourced', 'traditional methods',
            'zero waste', 'biodegradable', 'renewable'
        ]
        
        for keyword in sustainability_keywords:
            if keyword in description:
                bonus_factors += 0.1
        
        # Weighted combination
        overall = (co2_score * 0.4) + (waste_score * 0.4) + (bonus_factors * 0.2)
        
        return min(1.0, max(0.0, overall))
    
    def estimate_weight(self, product_data: Dict[str, Any]) -> float:
        """Estimate product weight based on category and description"""
        
        # Weight estimates by category (kg)
        weight_estimates = {
            'jewelry': 0.1,
            'textiles': 0.5,
            'pottery': 1.2,
            'woodwork': 2.0,
            'metalwork': 1.5,
            'paintings': 0.3,
            'sculpture': 3.0,
            'furniture': 10.0
        }
        
        category = product_data.get('category', 'textiles')
        base_weight = weight_estimates.get(category, 1.0)
        
        # Adjust based on description
        description = product_data.get('description', '').lower()
        
        if any(word in description for word in ['large', 'big', 'heavy']):
            base_weight *= 1.5
        elif any(word in description for word in ['small', 'mini', 'light']):
            base_weight *= 0.5
        
        return base_weight
    
    def get_transport_factor(self, product_data: Dict[str, Any]) -> float:
        """Get transportation impact factor"""
        location = product_data.get('location', '').lower()
        
        # Assume local if from major Indian craft regions
        local_regions = [
            'bihar', 'gujarat', 'rajasthan', 'uttar pradesh',
            'west bengal', 'kerala', 'karnataka', 'odisha'
        ]
        
        if any(region in location for region in local_regions):
            return 1.1  # Minimal transport impact
        else:
            return 1.4  # Higher transport impact for unknown/distant locations
    
    def categorize_carbon_impact(self, co2_kg: float) -> str:
        """Categorize carbon impact"""
        if co2_kg < 1:
            return "Very Low"
        elif co2_kg < 3:
            return "Low"
        elif co2_kg < 6:
            return "Medium"
        elif co2_kg < 10:
            return "High"
        else:
            return "Very High"
    
    def categorize_waste_impact(self, waste_score: float) -> str:
        """Categorize waste impact"""
        if waste_score < 0.3:
            return "Minimal Waste"
        elif waste_score < 0.6:
            return "Low Waste"
        elif waste_score < 1.0:
            return "Medium Waste"
        else:
            return "High Waste"
    
    def get_grade(self, score: float) -> str:
        """Get sustainability grade"""
        if score >= 0.9:
            return "A+"
        elif score >= 0.8:
            return "A"
        elif score >= 0.7:
            return "B+"
        elif score >= 0.6:
            return "B"
        elif score >= 0.5:
            return "C+"
        elif score >= 0.4:
            return "C"
        else:
            return "D"
    
    def generate_recommendations(self, co2_analysis: Dict, waste_analysis: Dict, product_data: Dict) -> List[str]:
        """Generate sustainability recommendations"""
        recommendations = []
        
        # CO2 recommendations
        if co2_analysis['total_co2_kg'] > 5:
            recommendations.append("🌱 Consider using more eco-friendly materials to reduce carbon footprint")
        
        if co2_analysis['transport_factor'] > 1.3:
            recommendations.append("📍 Source materials locally to reduce transportation emissions")
        
        # Waste recommendations
        if waste_analysis['waste_score'] < 0.6:
            recommendations.append("♻️ Implement zero-waste production techniques")
            recommendations.append("🔄 Consider using recycled or upcycled materials")
        
        # Material recommendations
        materials = self.extract_materials(product_data)
        has_sustainable_materials = any('recycled' in m or 'organic' in m for m in materials)
        
        if not has_sustainable_materials:
            recommendations.append("🌿 Add organic or recycled materials to improve sustainability")
        
        # Certification recommendations
        overall_score = self.calculate_overall_score(co2_analysis, waste_analysis, product_data)
        if overall_score > 0.7:
            recommendations.append("🏆 Eligible for sustainability certification - highlight this in marketing")
        
        return recommendations

# Integration class that combines all advanced models
class AdvancedCraftAnalyzer:
    """Main class that integrates all advanced ML models"""
    
    def __init__(self):
        logger.info("Initializing Advanced Craft Analyzer...")
        
        self.auto_tagger = AdvancedAutoTagger()
        self.pricing_model = AdvancedPricingModel()
        self.sustainability_analyzer = SustainabilityAnalyzer()
        
        logger.info("Advanced Craft Analyzer ready!")
    
    def comprehensive_analysis(self, product_data: Dict[str, Any], image_path: Optional[str] = None) -> Dict[str, Any]:
        """Run comprehensive analysis using all advanced models"""
        
        results = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'analysis_version': 'advanced_v1.0'
        }
        
        # Image analysis (if image provided)
        if image_path and Path(image_path).exists():
            results['image_analysis'] = {
                'clip_analysis': self.auto_tagger.analyze_image_clip(image_path),
                'mobilenet_analysis': self.auto_tagger.analyze_image_mobilenet(image_path)
            }
        
        # Pricing analysis
        results['pricing_analysis'] = self.pricing_model.predict_price({
            'craft_type': product_data.get('category', 'unknown'),
            'region': product_data.get('location', '').split(',')[-1].strip().lower(),
            'material_quality': 0.8,  # This would come from image/text analysis
            'sustainability_score': 0.7,  # Will be updated below
            'complexity_score': 0.6  # This would come from detailed analysis
        })
        
        # Sustainability analysis
        results['sustainability_analysis'] = self.sustainability_analyzer.analyze_sustainability(product_data)
        
        # Update pricing with actual sustainability score
        if results['sustainability_analysis']['overall_sustainability_score'] > 0:
            updated_pricing = self.pricing_model.predict_price({
                'craft_type': product_data.get('category', 'unknown'),
                'region': product_data.get('location', '').split(',')[-1].strip().lower(),
                'material_quality': 0.8,
                'sustainability_score': results['sustainability_analysis']['overall_sustainability_score'],
                'complexity_score': 0.6
            })
            results['pricing_analysis'] = updated_pricing
        
        return results

# Demo function
def demo_advanced_models():
    """Demo the advanced models"""
    print("=== CraftConnect Advanced ML Models Demo ===\n")
    
    analyzer = AdvancedCraftAnalyzer()
    
    # Sample product data
    product_data = {
        'title': 'Traditional Madhubani Painting',
        'description': 'Handmade Madhubani painting using natural pigments and traditional techniques. Created by skilled artisan from Bihar using organic materials and zero-waste methods.',
        'category': 'paintings',
        'location': 'Madhubani, Bihar',
        'materials': ['handmade paper', 'natural pigments', 'organic colors'],
        'artisan': 'Sita Devi',
        'price': 2500
    }
    
    # Run comprehensive analysis
    results = analyzer.comprehensive_analysis(product_data)
    
    print("Analysis Results:")
    print("================")
    
    # Pricing Analysis
    if 'pricing_analysis' in results:
        pricing = results['pricing_analysis']
        print(f"💰 Predicted Price: ₹{pricing['predicted_price']:.0f}")
        print(f"   Confidence: {pricing['confidence']:.1%}")
        print(f"   Price Range: ₹{pricing['price_range']['min']:.0f} - ₹{pricing['price_range']['max']:.0f}")
    
    # Sustainability Analysis
    if 'sustainability_analysis' in results:
        sustainability = results['sustainability_analysis']
        print(f"\n🌱 Sustainability Score: {sustainability['overall_sustainability_score']:.2f}")
        print(f"   Grade: {sustainability['sustainability_grade']}")
        print(f"   CO2 Impact: {sustainability['co2_analysis']['total_co2_kg']} kg CO2")
        print(f"   Carbon Category: {sustainability['co2_analysis']['carbon_category']}")
        
        if sustainability['recommendations']:
            print("   Recommendations:")
            for rec in sustainability['recommendations'][:3]:
                print(f"   • {rec}")

if __name__ == "__main__":
    demo_advanced_models()