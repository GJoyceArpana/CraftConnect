#!/usr/bin/env python3
"""
API wrapper for CraftConnect Auto-Tagging System
Provides easy-to-use functions for integrating auto-tagging into applications
"""

from typing import Dict, List, Optional
import json
from .auto_tagging import AutoTagger, CraftItem, TaggingResult
from .enhanced_features import EnhancedCraftAnalyzer, ImageAnalyzer
from .indian_crafts import IndianCraftSpecialist

class CraftConnectAPI:
    """Simple API wrapper for the auto-tagging system"""
    
    def __init__(self):
        self.tagger = AutoTagger()
        self.enhanced_analyzer = EnhancedCraftAnalyzer()
        self.image_analyzer = ImageAnalyzer()
        self.indian_specialist = IndianCraftSpecialist()
    
    def tag_craft_from_dict(self, item_data: Dict) -> Dict:
        """
        Tag a craft item from dictionary data
        
        Args:
            item_data: Dictionary with keys: title, description, price (optional), 
                      artisan (optional), location (optional), materials (optional)
        
        Returns:
            Dictionary with tagging results
        """
        # Create CraftItem from dictionary
        item = CraftItem(
            title=item_data.get('title', ''),
            description=item_data.get('description', ''),
            price=item_data.get('price'),
            artisan=item_data.get('artisan'),
            location=item_data.get('location'),
            materials=item_data.get('materials')
        )
        
        # Tag the item
        result = self.tagger.tag_item(item)
        
        # Run enhanced analysis
        materials_list = item_data.get('materials')
        if isinstance(materials_list, str):
            materials_list = [m.strip() for m in materials_list.split(',')]
        elif materials_list is None:
            materials_list = result.materials
        
        enhanced_analysis = self.enhanced_analyzer.comprehensive_analysis(
            item_data.get('title', ''),
            item_data.get('description', ''),
            item_data.get('price'),
            materials_list
        )
        
        # Convert to dictionary for JSON serialization
        basic_results = {
            'categories': result.categories,
            'materials': result.materials,
            'sustainability_tags': result.sustainability_tags,
            'eco_impact_score': result.eco_impact_score,
            'price_category': result.price_category,
            'extracted_features': result.extracted_features,
            'confidence_scores': result.confidence_scores
        }
        
        # Run Indian craft analysis
        indian_analysis = self.indian_specialist.comprehensive_indian_analysis(
            item_data.get('title', ''),
            item_data.get('description', ''),
            item_data.get('location'),
            materials_list
        )
        
        # Combine basic, enhanced, and Indian analysis results
        basic_results['enhanced_analysis'] = enhanced_analysis
        basic_results['indian_analysis'] = indian_analysis
        
        return basic_results
    
    def tag_craft_simple(self, title: str, description: str, price: Optional[float] = None) -> Dict:
        """
        Simple tagging function for basic use cases
        
        Args:
            title: Craft item title
            description: Craft item description
            price: Optional price
        
        Returns:
            Dictionary with tagging results
        """
        return self.tag_craft_from_dict({
            'title': title,
            'description': description,
            'price': price
        })
    
    def get_sustainability_score_only(self, title: str, description: str) -> float:
        """
        Get only the sustainability score for quick assessments
        
        Args:
            title: Craft item title
            description: Craft item description
        
        Returns:
            Eco-impact score (0.0 to 1.0)
        """
        result = self.tag_craft_simple(title, description)
        return result['eco_impact_score']
    
    def get_categories_only(self, title: str, description: str) -> List[str]:
        """
        Get only the categories for quick classification
        
        Args:
            title: Craft item title
            description: Craft item description
        
        Returns:
            List of detected categories
        """
        result = self.tag_craft_simple(title, description)
        return result['categories']

# Convenience functions for direct use
_api = None

def get_api():
    """Get singleton API instance"""
    global _api
    if _api is None:
        _api = CraftConnectAPI()
    return _api

def tag_craft(title: str, description: str, price: Optional[float] = None) -> Dict:
    """
    Quick function to tag a craft item
    
    Args:
        title: Craft item title
        description: Craft item description
        price: Optional price
    
    Returns:
        Dictionary with complete tagging results
    """
    return get_api().tag_craft_simple(title, description, price)

def get_sustainability_score(title: str, description: str) -> float:
    """
    Quick function to get sustainability score
    
    Args:
        title: Craft item title
        description: Craft item description
    
    Returns:
        Eco-impact score (0.0 to 1.0)
    """
    return get_api().get_sustainability_score_only(title, description)

def get_categories(title: str, description: str) -> List[str]:
    """
    Quick function to get categories
    
    Args:
        title: Craft item title
        description: Craft item description
    
    Returns:
        List of detected categories
    """
    return get_api().get_categories_only(title, description)

# Demo function
def demo_api():
    """Demonstrate the API usage"""
    print("=== CraftConnect Auto-Tagging API Demo ===")
    print()
    
    # Test basic tagging
    result = tag_craft(
        "Handwoven Organic Hemp Basket",
        "Beautiful basket woven from organic hemp fibers. Locally sourced materials and traditional weaving techniques. Perfect for eco-conscious homes."
    )
    
    print("Full tagging result:")
    for key, value in result.items():
        print(f"  {key}: {value}")
    print()
    
    # Test quick functions
    score = get_sustainability_score(
        "Recycled Plastic Bottle Planter",
        "Upcycled planter made from recycled plastic bottles. Great for urban gardening and reducing waste."
    )
    print(f"Sustainability score: {score:.2f}")
    
    categories = get_categories(
        "Silver Wire Wrapped Ring",
        "Handcrafted ring featuring silver wire wrapping technique with natural stone."
    )
    print(f"Categories: {', '.join(categories)}")

if __name__ == "__main__":
    demo_api()