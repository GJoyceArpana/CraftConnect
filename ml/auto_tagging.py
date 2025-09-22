#!/usr/bin/env python3
"""
Auto-tagging script for CraftConnect
An AI-powered system to automatically tag sustainable crafts with categories,
materials, sustainability scores, and pricing insights.
"""

import re
import json
from typing import Dict, List, Set, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

# Try importing ML libraries, fall back to basic functionality if not available
try:
    import nltk
    from zipfile import BadZipFile
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import PorterStemmer
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("NLTK not available, using basic text processing")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available, using rule-based classification")

@dataclass
class CraftItem:
    """Data model for a craft item"""
    title: str
    description: str
    price: Optional[float] = None
    artisan: Optional[str] = None
    location: Optional[str] = None
    materials: Optional[List[str]] = None
    images: Optional[List[str]] = None
    
@dataclass
class TaggingResult:
    """Result of auto-tagging process"""
    categories: List[str]
    materials: List[str]
    sustainability_tags: List[str]
    eco_impact_score: float
    price_category: str
    extracted_features: Dict[str, any]
    confidence_scores: Dict[str, float]

class AutoTagger:
    """Main auto-tagging system for CraftConnect marketplace"""
    
    def __init__(self):
        self.craft_categories = {
            'jewelry': ['ring', 'necklace', 'bracelet', 'earring', 'pendant', 'brooch', 'anklet'],
            'textiles': ['scarf', 'bag', 'purse', 'clothing', 'fabric', 'embroidery', 'weaving', 'knitting'],
            'pottery': ['vase', 'bowl', 'mug', 'plate', 'ceramic', 'clay', 'pottery'],
            'woodwork': ['furniture', 'carving', 'sculpture', 'wooden', 'timber', 'oak', 'pine'],
            'metalwork': ['steel', 'iron', 'copper', 'bronze', 'aluminum', 'metal'],
            'glasswork': ['glass', 'blown', 'stained', 'crystal', 'mirror'],
            'leather': ['leather', 'hide', 'suede', 'belt', 'wallet', 'boots'],
            'fiber_arts': ['yarn', 'wool', 'cotton', 'silk', 'hemp', 'linen', 'crochet']
        }
        
        self.sustainable_materials = {
            'recycled': ['recycled', 'upcycled', 'repurposed', 'reclaimed'],
            'organic': ['organic', 'natural', 'eco-friendly', 'biodegradable'],
            'renewable': ['bamboo', 'cork', 'hemp', 'jute', 'rattan'],
            'local': ['local', 'locally sourced', 'regional', 'native'],
            'fair_trade': ['fair trade', 'ethically sourced', 'sustainable'],
            'low_impact': ['solar dried', 'hand made', 'minimal packaging', 'carbon neutral']
        }
        
        self.price_categories = {
            'budget': (0, 25),
            'affordable': (25, 75),
            'mid_range': (75, 200),
            'premium': (200, 500),
            'luxury': (500, float('inf'))
        }
        
        # Initialize NLTK components if available
        if NLTK_AVAILABLE:
            try:
                nltk.data.find('tokenizers/punkt')
                nltk.data.find('corpora/stopwords')
            except (LookupError, BadZipFile):
                print("Downloading NLTK data...")
                nltk.download('punkt', quiet=True)
                nltk.download('stopwords', quiet=True)
            
            self.stop_words = set(stopwords.words('english'))
            self.stemmer = PorterStemmer()
        else:
            self.stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            self.stemmer = None
    
    def preprocess_text(self, text: str) -> List[str]:
        """Clean and preprocess text for analysis"""
        if not text:
            return []
        
        # Convert to lowercase and remove special characters
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
        
        if NLTK_AVAILABLE:
            tokens = word_tokenize(text)
            tokens = [self.stemmer.stem(token) for token in tokens if token not in self.stop_words]
        else:
            # Basic tokenization
            tokens = text.split()
            tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]
        
        return tokens
    
    def extract_categories(self, item: CraftItem) -> Tuple[List[str], Dict[str, float]]:
        """Extract craft categories from item description"""
        text = f"{item.title} {item.description}".lower()
        detected_categories = []
        confidence_scores = {}
        
        for category, keywords in self.craft_categories.items():
            matches = sum(1 for keyword in keywords if keyword in text)
            if matches > 0:
                confidence = min(matches / len(keywords), 1.0)
                detected_categories.append(category)
                confidence_scores[category] = confidence
        
        # Sort by confidence
        detected_categories.sort(key=lambda x: confidence_scores[x], reverse=True)
        
        return detected_categories, confidence_scores
    
    def extract_materials(self, item: CraftItem) -> List[str]:
        """Extract materials mentioned in the description"""
        text = f"{item.title} {item.description}".lower()
        materials = []
        
        # Common craft materials
        material_keywords = [
            'wood', 'metal', 'glass', 'ceramic', 'clay', 'leather', 'fabric',
            'cotton', 'wool', 'silk', 'linen', 'hemp', 'bamboo', 'cork',
            'silver', 'gold', 'copper', 'bronze', 'steel', 'iron',
            'plastic', 'resin', 'stone', 'marble', 'granite'
        ]
        
        for material in material_keywords:
            if material in text:
                materials.append(material)
        
        # Add materials from item.materials if provided
        if item.materials:
            materials.extend(item.materials)
        
        return list(set(materials))  # Remove duplicates
    
    def calculate_eco_impact_score(self, item: CraftItem, materials: List[str]) -> Tuple[float, List[str]]:
        """Calculate eco-impact score and extract sustainability tags"""
        text = f"{item.title} {item.description}".lower()
        sustainability_tags = []
        base_score = 0.3  # Base sustainability score
        
        for category, keywords in self.sustainable_materials.items():
            for keyword in keywords:
                if keyword in text:
                    sustainability_tags.append(keyword)
                    # Add points based on sustainability category
                    if category == 'recycled':
                        base_score += 0.2
                    elif category == 'organic':
                        base_score += 0.15
                    elif category == 'renewable':
                        base_score += 0.15
                    elif category == 'local':
                        base_score += 0.1
                    elif category == 'fair_trade':
                        base_score += 0.1
                    elif category == 'low_impact':
                        base_score += 0.1
        
        # Bonus for handmade items
        handmade_keywords = ['handmade', 'hand made', 'artisan', 'crafted', 'handcrafted']
        if any(keyword in text for keyword in handmade_keywords):
            base_score += 0.1
            sustainability_tags.append('handmade')
        
        # Cap the score at 1.0
        eco_score = min(base_score, 1.0)
        
        return eco_score, list(set(sustainability_tags))
    
    def categorize_price(self, price: Optional[float]) -> str:
        """Categorize item price into predefined ranges"""
        if price is None:
            return 'unknown'
        
        for category, (min_price, max_price) in self.price_categories.items():
            if min_price <= price < max_price:
                return category
        
        return 'luxury'
    
    def tag_item(self, item: CraftItem) -> TaggingResult:
        """Main method to auto-tag a craft item"""
        # Extract categories
        categories, category_confidence = self.extract_categories(item)
        
        # Extract materials
        materials = self.extract_materials(item)
        
        # Calculate eco-impact
        eco_score, sustainability_tags = self.calculate_eco_impact_score(item, materials)
        
        # Categorize price
        price_category = self.categorize_price(item.price)
        
        # Extract additional features
        extracted_features = {
            'word_count': len(item.description.split()) if item.description else 0,
            'has_location': item.location is not None,
            'has_artisan': item.artisan is not None,
            'material_count': len(materials)
        }
        
        # Compile confidence scores
        confidence_scores = {
            'categories': category_confidence,
            'eco_impact': eco_score,
            'overall': sum(category_confidence.values()) / len(category_confidence) if category_confidence else 0.0
        }
        
        return TaggingResult(
            categories=categories,
            materials=materials,
            sustainability_tags=sustainability_tags,
            eco_impact_score=eco_score,
            price_category=price_category,
            extracted_features=extracted_features,
            confidence_scores=confidence_scores
        )
    
    def batch_tag_items(self, items: List[CraftItem]) -> List[TaggingResult]:
        """Tag multiple items in batch"""
        return [self.tag_item(item) for item in items]

def demo_auto_tagging():
    """Demonstrate the auto-tagging system with sample data"""
    print("=== CraftConnect Auto-Tagging System Demo ===")
    print()
    
    # Create sample craft items
    sample_items = [
        CraftItem(
            title="Handmade Recycled Glass Vase",
            description="Beautiful vase crafted from recycled glass bottles. Eco-friendly and locally sourced materials. Perfect for sustainable home decor.",
            price=45.00,
            artisan="Maya Glassworks",
            location="Portland, OR"
        ),
        CraftItem(
            title="Organic Cotton Embroidered Scarf",
            description="Soft organic cotton scarf with traditional embroidery. Fair trade certified and hand-woven by local artisans.",
            price=32.50,
            artisan="Textile Collective",
            materials=["organic cotton", "silk thread"]
        ),
        CraftItem(
            title="Reclaimed Wood Jewelry Box",
            description="Handcrafted jewelry box made from reclaimed oak wood. Features hand-carved details and eco-friendly finish.",
            price=125.00,
            location="Vermont"
        )
    ]
    
    # Initialize auto-tagger
    tagger = AutoTagger()
    
    # Tag each item
    for i, item in enumerate(sample_items, 1):
        print(f"\n--- Item {i}: {item.title} ---")
        result = tagger.tag_item(item)
        
        print(f"Categories: {', '.join(result.categories)}")
        print(f"Materials: {', '.join(result.materials)}")
        print(f"Sustainability Tags: {', '.join(result.sustainability_tags)}")
        print(f"Eco-Impact Score: {result.eco_impact_score:.2f}/1.00")
        print(f"Price Category: {result.price_category}")
        print(f"Overall Confidence: {result.confidence_scores['overall']:.2f}")
        print()
    
    print("\n=== Auto-Tagging Complete ===")
    print("\nTo use this system in your application:")
    print("1. Install dependencies: pip install -r requirements.txt")
    print("2. Create CraftItem objects with your data")
    print("3. Use AutoTagger.tag_item() or AutoTagger.batch_tag_items()")
    print("4. Access the TaggingResult for categories, sustainability scores, etc.")

def main():
    """Main function to run the auto-tagging system"""
    demo_auto_tagging()

if __name__ == "__main__":
    main()
