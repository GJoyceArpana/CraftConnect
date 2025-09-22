#!/usr/bin/env python3
"""
Enhanced ML Features for CraftConnect Auto-Tagging System
Includes sentiment analysis, trend detection, market insights, and future image analysis capabilities
"""

import re
import json
import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import Counter

# Advanced text analysis
try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    print("TextBlob not available - sentiment analysis will be basic")

class EnhancedCraftAnalyzer:
    """Enhanced analyzer with advanced ML features"""
    
    def __init__(self):
        # Market trends and seasonal patterns
        self.seasonal_trends = {
            'spring': ['garden', 'floral', 'pastel', 'Easter', 'renewal', 'fresh'],
            'summer': ['beach', 'tropical', 'bright', 'vacation', 'outdoor', 'festival'],
            'fall': ['autumn', 'harvest', 'orange', 'cozy', 'thanksgiving', 'warm'],
            'winter': ['holiday', 'Christmas', 'cozy', 'warm', 'indoor', 'gift']
        }
        
        # Price prediction features
        self.premium_indicators = [
            'handcrafted', 'artisan', 'bespoke', 'custom', 'limited edition',
            'exclusive', 'designer', 'luxury', 'premium', 'high-quality'
        ]
        
        # Sustainability scoring weights
        self.sustainability_weights = {
            'recycled_materials': 0.25,
            'organic_materials': 0.20,
            'local_sourcing': 0.15,
            'fair_trade': 0.15,
            'renewable_materials': 0.10,
            'minimal_packaging': 0.05,
            'carbon_neutral': 0.10
        }
        
        # Market demand patterns
        self.high_demand_keywords = [
            'minimalist', 'bohemian', 'vintage', 'rustic', 'modern',
            'personalized', 'custom', 'unique', 'one-of-a-kind'
        ]
        
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment of product description"""
        if not text:
            return {'polarity': 0.0, 'subjectivity': 0.0, 'sentiment_score': 0.5}
        
        if TEXTBLOB_AVAILABLE:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1 to 1
            subjectivity = blob.sentiment.subjectivity  # 0 to 1
            
            # Convert to 0-1 sentiment score
            sentiment_score = (polarity + 1) / 2
        else:
            # Basic sentiment analysis using keyword matching
            positive_words = ['beautiful', 'amazing', 'gorgeous', 'stunning', 'perfect',
                            'love', 'wonderful', 'excellent', 'fantastic', 'quality']
            negative_words = ['cheap', 'poor', 'bad', 'terrible', 'awful', 'ugly']
            
            text_lower = text.lower()
            positive_count = sum(1 for word in positive_words if word in text_lower)
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if positive_count + negative_count > 0:
                sentiment_score = positive_count / (positive_count + negative_count)
            else:
                sentiment_score = 0.5
            
            polarity = (sentiment_score - 0.5) * 2
            subjectivity = min(1.0, (positive_count + negative_count) / 10)
        
        return {
            'polarity': polarity,
            'subjectivity': subjectivity,
            'sentiment_score': sentiment_score
        }
    
    def detect_seasonal_relevance(self, text: str) -> Dict[str, float]:
        """Detect seasonal relevance of the product"""
        text_lower = text.lower()
        seasonal_scores = {}
        
        for season, keywords in self.seasonal_trends.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            seasonal_scores[season] = min(1.0, score / len(keywords))
        
        # Find the most relevant season
        best_season = max(seasonal_scores, key=seasonal_scores.get)
        max_score = seasonal_scores[best_season]
        
        return {
            'seasonal_scores': seasonal_scores,
            'primary_season': best_season if max_score > 0 else 'year_round',
            'seasonality_strength': max_score
        }
    
    def analyze_market_potential(self, title: str, description: str, price: Optional[float]) -> Dict[str, any]:
        """Analyze market potential and demand indicators"""
        text = f"{title} {description}".lower()
        
        # Demand score based on trending keywords
        demand_score = 0
        matching_trends = []
        
        for keyword in self.high_demand_keywords:
            if keyword in text:
                demand_score += 1
                matching_trends.append(keyword)
        
        demand_score = min(1.0, demand_score / 5)  # Normalize to 0-1
        
        # Premium potential
        premium_score = 0
        premium_features = []
        
        for indicator in self.premium_indicators:
            if indicator in text:
                premium_score += 1
                premium_features.append(indicator)
        
        premium_score = min(1.0, premium_score / 3)  # Normalize to 0-1
        
        # Price competitiveness (if price provided)
        price_competitiveness = 0.5  # Default neutral
        if price is not None:
            # Simple heuristic: compare to expected price ranges
            if price < 20:
                price_competitiveness = 0.8  # Budget-friendly
            elif price < 50:
                price_competitiveness = 0.9  # Affordable
            elif price < 100:
                price_competitiveness = 0.7  # Mid-range
            elif price < 200:
                price_competitiveness = 0.5  # Premium
            else:
                price_competitiveness = 0.3  # Luxury
        
        return {
            'demand_score': demand_score,
            'premium_potential': premium_score,
            'price_competitiveness': price_competitiveness,
            'trending_features': matching_trends,
            'premium_features': premium_features,
            'overall_market_score': (demand_score + premium_score + price_competitiveness) / 3
        }
    
    def calculate_uniqueness_score(self, title: str, description: str) -> float:
        """Calculate how unique/distinctive the product is"""
        text = f"{title} {description}".lower()
        
        # Unique indicators
        unique_keywords = [
            'one-of-a-kind', 'unique', 'custom', 'personalized', 'bespoke',
            'handmade', 'artisan', 'original', 'exclusive', 'limited'
        ]
        
        uniqueness_score = 0
        for keyword in unique_keywords:
            if keyword in text:
                uniqueness_score += 1
        
        # Check for specific techniques or materials
        technique_keywords = [
            'hand-carved', 'hand-painted', 'hand-woven', 'etched', 'embossed',
            'stamped', 'forged', 'thrown', 'blown', 'cast'
        ]
        
        for technique in technique_keywords:
            if technique in text:
                uniqueness_score += 0.5
        
        return min(1.0, uniqueness_score / 5)  # Normalize to 0-1
    
    def predict_optimal_pricing(self, title: str, description: str, materials: List[str]) -> Dict[str, any]:
        """Predict optimal price range based on features"""
        text = f"{title} {description}".lower()
        
        # Base price factors
        base_score = 20  # Starting point
        
        # Material quality factor
        premium_materials = ['gold', 'silver', 'platinum', 'leather', 'silk', 'wool', 'hardwood']
        for material in materials:
            if any(pm in material.lower() for pm in premium_materials):
                base_score += 15
        
        # Craftsmanship factor
        if any(word in text for word in ['handmade', 'artisan', 'crafted']):
            base_score += 20
        
        # Complexity factor
        complexity_words = ['detailed', 'intricate', 'complex', 'carved', 'embroidered']
        if any(word in text for word in complexity_words):
            base_score += 15
        
        # Size indicators (larger items generally cost more)
        size_indicators = ['large', 'big', 'oversized', 'furniture']
        if any(word in text for word in size_indicators):
            base_score += 25
        
        # Sustainability premium
        sustainability_words = ['organic', 'recycled', 'sustainable', 'eco-friendly']
        if any(word in text for word in sustainability_words):
            base_score += 10
        
        # Calculate price ranges
        predicted_min = max(5, base_score * 0.7)
        predicted_max = base_score * 1.5
        predicted_optimal = base_score
        
        return {
            'predicted_min': round(predicted_min, 2),
            'predicted_max': round(predicted_max, 2),
            'predicted_optimal': round(predicted_optimal, 2),
            'confidence': min(1.0, len(materials) / 3 + 0.5),  # Higher confidence with more material info
            'price_factors': {
                'material_quality': len([m for m in materials if any(pm in m.lower() for pm in premium_materials)]),
                'craftsmanship': 'handmade' in text or 'artisan' in text,
                'complexity': any(word in text for word in complexity_words),
                'sustainability': any(word in text for word in sustainability_words)
            }
        }
    
    def analyze_target_audience(self, title: str, description: str, price: Optional[float]) -> Dict[str, any]:
        """Analyze target audience based on product characteristics"""
        text = f"{title} {description}".lower()
        
        # Age group indicators
        age_groups = {
            'teens': ['trendy', 'fun', 'colorful', 'modern', 'social'],
            'young_adults': ['minimalist', 'apartment', 'first home', 'student'],
            'adults': ['professional', 'office', 'family', 'home', 'quality'],
            'seniors': ['traditional', 'classic', 'elegant', 'timeless', 'heritage']
        }
        
        # Interest-based targeting
        interests = {
            'home_decor': ['decoration', 'interior', 'home', 'room', 'wall'],
            'fashion': ['jewelry', 'accessory', 'style', 'fashion', 'wear'],
            'gardening': ['garden', 'plant', 'outdoor', 'patio', 'greenhouse'],
            'cooking': ['kitchen', 'cooking', 'food', 'dining', 'recipe']
        }
        
        # Calculate scores
        age_scores = {}
        for age_group, keywords in age_groups.items():
            age_scores[age_group] = sum(1 for keyword in keywords if keyword in text)
        
        interest_scores = {}
        for interest, keywords in interests.items():
            interest_scores[interest] = sum(1 for keyword in keywords if keyword in text)
        
        # Determine primary targets
        primary_age = max(age_scores, key=age_scores.get) if max(age_scores.values()) > 0 else 'general'
        primary_interest = max(interest_scores, key=interest_scores.get) if max(interest_scores.values()) > 0 else 'general'
        
        # Price-based demographic (Indian Rupees)
        if price is not None:
            if price < 500:
                price_demographic = 'budget_conscious'    # < ₹500
            elif price < 1500:
                price_demographic = 'value_seekers'       # ₹500-1500
            elif price < 5000:
                price_demographic = 'quality_focused'     # ₹1500-5000
            elif price < 15000:
                price_demographic = 'premium_buyers'      # ₹5000-15000
            else:
                price_demographic = 'luxury_buyers'       # ₹15000+
        else:
            price_demographic = 'unknown'
        
        return {
            'primary_age_group': primary_age,
            'primary_interest': primary_interest,
            'price_demographic': price_demographic,
            'age_scores': age_scores,
            'interest_scores': interest_scores,
            'target_confidence': max(max(age_scores.values()), max(interest_scores.values())) / 3
        }
    
    def generate_marketing_suggestions(self, tags_result: Dict, enhanced_analysis: Dict) -> List[str]:
        """Generate marketing suggestions based on analysis results"""
        suggestions = []
        
        # Sustainability marketing
        if tags_result.get('eco_impact_score', 0) > 0.6:
            suggestions.append("🌱 Highlight eco-friendly aspects in marketing materials")
            suggestions.append("📱 Target environmentally conscious social media groups")
        
        # Seasonal marketing
        seasonal_data = enhanced_analysis.get('seasonal_analysis', {})
        if seasonal_data.get('seasonality_strength', 0) > 0.5:
            season = seasonal_data.get('primary_season', 'year_round')
            suggestions.append(f"📅 Perfect for {season} marketing campaigns")
        
        # Price positioning
        market_data = enhanced_analysis.get('market_analysis', {})
        if market_data.get('premium_potential', 0) > 0.6:
            suggestions.append("💎 Position as premium/luxury item")
            suggestions.append("🎯 Target affluent customer segments")
        
        # Uniqueness angle
        if enhanced_analysis.get('uniqueness_score', 0) > 0.7:
            suggestions.append("⭐ Emphasize unique, one-of-a-kind nature")
            suggestions.append("📸 Showcase craftsmanship in detail photos")
        
        # Trending features
        trending = market_data.get('trending_features', [])
        if trending:
            suggestions.append(f"📈 Leverage trending keywords: {', '.join(trending)}")
        
        # Sentiment-based suggestions
        sentiment_data = enhanced_analysis.get('sentiment_analysis', {})
        if sentiment_data.get('sentiment_score', 0.5) > 0.7:
            suggestions.append("😊 Use positive customer testimonials prominently")
        
        # Target audience suggestions
        audience_data = enhanced_analysis.get('audience_analysis', {})
        primary_interest = audience_data.get('primary_interest', '')
        if primary_interest != 'general':
            suggestions.append(f"🎯 Focus marketing on {primary_interest.replace('_', ' ')} enthusiasts")
        
        return suggestions
    
    def comprehensive_analysis(self, title: str, description: str, price: Optional[float] = None, 
                             materials: Optional[List[str]] = None) -> Dict[str, any]:
        """Run comprehensive enhanced analysis"""
        if materials is None:
            materials = []
        
        # Run all enhanced analyses
        sentiment_analysis = self.analyze_sentiment(description)
        seasonal_analysis = self.detect_seasonal_relevance(f"{title} {description}")
        market_analysis = self.analyze_market_potential(title, description, price)
        uniqueness_score = self.calculate_uniqueness_score(title, description)
        pricing_analysis = self.predict_optimal_pricing(title, description, materials)
        audience_analysis = self.analyze_target_audience(title, description, price)
        
        # Combine all analyses
        enhanced_results = {
            'sentiment_analysis': sentiment_analysis,
            'seasonal_analysis': seasonal_analysis,
            'market_analysis': market_analysis,
            'uniqueness_score': uniqueness_score,
            'pricing_analysis': pricing_analysis,
            'audience_analysis': audience_analysis,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # Generate marketing suggestions
        marketing_suggestions = self.generate_marketing_suggestions({}, enhanced_results)
        enhanced_results['marketing_suggestions'] = marketing_suggestions
        
        return enhanced_results

# Future: Image Analysis Capabilities (placeholder for when image processing is added)
class ImageAnalyzer:
    """Placeholder for future image analysis capabilities"""
    
    def __init__(self):
        self.supported_formats = ['jpg', 'jpeg', 'png', 'webp', 'bmp']
    
    def analyze_image(self, image_path: str) -> Dict[str, any]:
        """Placeholder for image analysis - returns mock data for now"""
        return {
            'colors_detected': ['brown', 'natural', 'wood'],
            'style_detected': 'rustic',
            'quality_score': 0.8,
            'composition_score': 0.7,
            'suggested_improvements': [
                'Better lighting could improve photo quality',
                'Show multiple angles for better presentation'
            ],
            'note': 'Image analysis feature coming soon!'
        }
    
    def suggest_photo_improvements(self, image_path: str) -> List[str]:
        """Suggest photo improvements for better marketplace presentation"""
        return [
            "📸 Use natural lighting when possible",
            "🎨 Show the item from multiple angles",
            "📐 Include size reference objects",
            "🎯 Use neutral backgrounds to highlight the product",
            "✨ Ensure the image is sharp and well-focused"
        ]

def demo_enhanced_features():
    """Demo the enhanced features"""
    print("=== CraftConnect Enhanced ML Features Demo ===")
    print()
    
    analyzer = EnhancedCraftAnalyzer()
    
    # Sample product
    title = "Handcrafted Reclaimed Oak Dining Table"
    description = "Beautiful dining table made from reclaimed oak wood. Features traditional joinery techniques and eco-friendly finish. Perfect for family gatherings and sustainable living. Handcrafted by local artisan with 20 years experience."
    price = 850.00
    materials = ["reclaimed oak", "natural beeswax", "traditional joinery"]
    
    # Run comprehensive analysis
    results = analyzer.comprehensive_analysis(title, description, price, materials)
    
    print(f"Product: {title}")
    print(f"Price: ${price}")
    print()
    
    # Display results
    for category, data in results.items():
        if category == 'analysis_timestamp':
            continue
            
        print(f"--- {category.replace('_', ' ').title()} ---")
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, float):
                    print(f"  {key}: {value:.2f}")
                elif isinstance(value, list) and value:
                    print(f"  {key}: {', '.join(map(str, value))}")
                elif not isinstance(value, (dict, list)):
                    print(f"  {key}: {value}")
        elif isinstance(data, list):
            for item in data:
                print(f"  • {item}")
        else:
            print(f"  {data}")
        print()

if __name__ == "__main__":
    demo_enhanced_features()