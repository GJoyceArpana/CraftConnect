#!/usr/bin/env python3
"""
Example usage of CraftConnect Auto-Tagging System
Shows how to integrate the tagging system into your application
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml import tag_craft, get_sustainability_score, get_categories, AutoTagger, CraftItem

def example_basic_usage():
    """Example of basic usage with simple functions"""
    print("=== Basic Usage Example ===")
    
    # Simple tagging
    result = tag_craft(
        title="Handmade Bamboo Wind Chimes", 
        description="Beautiful wind chimes made from sustainable bamboo. Locally sourced and hand-carved by skilled artisans. Perfect for garden decoration.",
        price=28.50
    )
    
    print("Complete tagging result:")
    for key, value in result.items():
        print(f"  {key}: {value}")
    print()

def example_batch_processing():
    """Example of processing multiple items"""
    print("=== Batch Processing Example ===")
    
    # Sample craft items data (could come from database, API, etc.)
    craft_data = [
        {
            "title": "Recycled Denim Tote Bag",
            "description": "Stylish tote bag upcycled from old denim jeans. Features organic cotton lining and locally made handles.",
            "price": 42.00,
            "artisan": "EcoFashion Studio"
        },
        {
            "title": "Hand-thrown Ceramic Mug",
            "description": "Beautiful ceramic coffee mug made from local clay. Lead-free glaze and dishwasher safe.",
            "price": 18.00,
            "location": "Vermont"
        },
        {
            "title": "Reclaimed Wood Picture Frame",
            "description": "Rustic picture frame crafted from reclaimed barn wood. Each piece has unique character and history.",
            "price": 35.00
        }
    ]
    
    # Process each item
    tagger = AutoTagger()
    for i, item_data in enumerate(craft_data, 1):
        # Create CraftItem object
        item = CraftItem(
            title=item_data["title"],
            description=item_data["description"],
            price=item_data.get("price"),
            artisan=item_data.get("artisan"),
            location=item_data.get("location")
        )
        
        # Tag the item
        result = tagger.tag_item(item)
        
        print(f"Item {i}: {item.title}")
        print(f"  Categories: {', '.join(result.categories)}")
        print(f"  Sustainability Score: {result.eco_impact_score:.2f}")
        print(f"  Price Category: {result.price_category}")
        print()

def example_filtering_and_search():
    """Example of using tags for filtering and search"""
    print("=== Filtering and Search Example ===")
    
    # Sample marketplace items
    items = [
        ("Organic Cotton Baby Blanket", "Soft baby blanket made from 100% organic cotton. Fair trade certified.", 45.00),
        ("Steel Wire Sculpture", "Modern sculpture crafted from recycled steel wire. Industrial aesthetic.", 120.00), 
        ("Hemp Rope Basket", "Storage basket woven from natural hemp rope. Biodegradable and sustainable.", 28.00),
        ("Plastic Bottle Planter", "Creative planter made from upcycled plastic bottles. Great for herbs.", 15.00)
    ]
    
    print("Finding highly sustainable items (score > 0.6):")
    for title, desc, price in items:
        score = get_sustainability_score(title, desc)
        if score > 0.6:
            categories = get_categories(title, desc)
            print(f"  ✓ {title} (Score: {score:.2f}, Categories: {', '.join(categories)})")
    print()
    
    print("Finding textile items:")
    for title, desc, price in items:
        categories = get_categories(title, desc)
        if 'textiles' in categories or 'fiber_arts' in categories:
            print(f"  ✓ {title} - ${price}")
    print()

def example_integration_patterns():
    """Example integration patterns for different use cases"""
    print("=== Integration Patterns ===")
    
    # Pattern 1: Product listing enhancement
    def enhance_product_listing(title, description, price):
        """Add auto-generated tags to product listing"""
        result = tag_craft(title, description, price)
        return {
            'title': title,
            'description': description,
            'price': price,
            'auto_tags': {
                'categories': result['categories'],
                'sustainability_score': result['eco_impact_score'],
                'price_tier': result['price_category'],
                'materials': result['materials']
            }
        }
    
    enhanced = enhance_product_listing(
        "Handwoven Alpaca Wool Scarf",
        "Luxurious scarf made from ethically sourced alpaca wool. Hand-dyed with natural plant colors.",
        85.00
    )
    
    print("Enhanced product listing:")
    print(f"  Title: {enhanced['title']}")
    print(f"  Auto-generated tags: {enhanced['auto_tags']}")
    print()
    
    # Pattern 2: Sustainability filtering
    def get_eco_friendly_items(items, min_score=0.5):
        """Filter items by sustainability score"""
        eco_items = []
        for title, desc, price in items:
            score = get_sustainability_score(title, desc)
            if score >= min_score:
                eco_items.append((title, score))
        return sorted(eco_items, key=lambda x: x[1], reverse=True)
    
    sample_items = [
        ("Regular Plastic Keychain", "Colorful plastic keychain", 5.00),
        ("Bamboo Phone Case", "Eco-friendly phone case made from bamboo fiber", 25.00),
        ("Recycled Paper Notebook", "Notebook made from 100% recycled paper", 12.00)
    ]
    
    eco_items = get_eco_friendly_items(sample_items, min_score=0.5)
    print("Eco-friendly items (score >= 0.5):")
    for title, score in eco_items:
        print(f"  ✓ {title} (Score: {score:.2f})")

def main():
    """Run all examples"""
    example_basic_usage()
    example_batch_processing()
    example_filtering_and_search()
    example_integration_patterns()
    
    print("\n=== Integration Tips ===")
    print("1. Use tag_craft() for simple one-off tagging")
    print("2. Use AutoTagger class for batch processing or when you need more control")
    print("3. Use get_sustainability_score() for quick eco-assessment")
    print("4. Use get_categories() for product categorization")
    print("5. Consider caching results for frequently accessed items")
    print("6. Install optional dependencies (nltk, sklearn) for better accuracy")

if __name__ == "__main__":
    main()
