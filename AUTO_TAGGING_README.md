# CraftConnect Auto-Tagging System

## Overview

The CraftConnect Auto-Tagging System is an AI-powered solution designed specifically for sustainable craft marketplaces. It automatically analyzes craft item descriptions and generates comprehensive tags including categories, materials, sustainability scores, and pricing insights.

## Features

- **Automatic Category Classification**: Identifies craft categories (jewelry, textiles, pottery, woodwork, etc.)
- **Material Extraction**: Detects materials mentioned in descriptions
- **Sustainability Scoring**: Calculates eco-impact scores (0.0 to 1.0) based on sustainable practices
- **Price Categorization**: Automatically categorizes items by price range
- **Batch Processing**: Supports processing multiple items efficiently
- **Confidence Scoring**: Provides confidence metrics for all classifications

## Quick Start

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. For better accuracy (optional):
```bash
# These will be automatically downloaded when first used
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

### Basic Usage

```python
from ml import tag_craft, get_sustainability_score, get_categories

# Simple tagging
result = tag_craft(
    title=\"Handmade Recycled Glass Vase\",
    description=\"Beautiful vase crafted from recycled glass bottles. Eco-friendly and locally sourced.\",
    price=45.00
)

print(result['categories'])           # ['glasswork', 'pottery']
print(result['eco_impact_score'])     # 1.0
print(result['sustainability_tags'])  # ['recycled', 'eco-friendly', 'locally sourced', ...]
```

### Advanced Usage

```python
from ml import AutoTagger, CraftItem

# For batch processing or more control
tagger = AutoTagger()

item = CraftItem(
    title=\"Organic Cotton Scarf\",
    description=\"Hand-woven scarf made from organic cotton. Fair trade certified.\",
    price=32.50,
    artisan=\"Textile Collective\",
    location=\"Portland, OR\"
)

result = tagger.tag_item(item)
```

## System Components

### 1. CraftItem Data Model
Represents a craft item with the following fields:
- `title`: Item title (required)
- `description`: Item description (required)
- `price`: Item price (optional)
- `artisan`: Artisan/creator name (optional)
- `location`: Location/origin (optional)
- `materials`: List of materials (optional)

### 2. AutoTagger Class
Main tagging engine with the following capabilities:

#### Category Detection
Recognizes 8 main craft categories:
- **Jewelry**: rings, necklaces, bracelets, earrings
- **Textiles**: scarves, bags, clothing, embroidery
- **Pottery**: vases, bowls, mugs, ceramics
- **Woodwork**: furniture, carvings, sculptures
- **Metalwork**: steel, copper, bronze items
- **Glasswork**: blown glass, stained glass
- **Leather**: belts, wallets, bags
- **Fiber Arts**: yarn, wool, cotton items

#### Sustainability Scoring
Evaluates items based on:
- **Recycled Materials** (+0.2 points): recycled, upcycled, repurposed
- **Organic Materials** (+0.15 points): organic, natural, eco-friendly
- **Renewable Materials** (+0.15 points): bamboo, cork, hemp
- **Local Sourcing** (+0.1 points): locally sourced, regional
- **Fair Trade** (+0.1 points): fair trade, ethically sourced
- **Low Impact** (+0.1 points): handmade, solar dried
- **Base Score**: 0.3 (all items start with this base)

#### Price Categories
- **Budget**: $0 - $25
- **Affordable**: $25 - $75  
- **Mid-range**: $75 - $200
- **Premium**: $200 - $500
- **Luxury**: $500+

### 3. API Functions
Convenience functions for easy integration:

```python
# Quick tagging
tag_craft(title, description, price=None)

# Get only sustainability score
get_sustainability_score(title, description)

# Get only categories
get_categories(title, description)
```

## Integration Examples

### E-commerce Product Enhancement
```python
def enhance_product_listing(product_data):
    result = tag_craft(product_data['title'], product_data['description'], product_data['price'])
    product_data['auto_tags'] = {
        'categories': result['categories'],
        'sustainability_score': result['eco_impact_score'],
        'materials': result['materials']
    }
    return product_data
```

### Sustainability Filtering
```python
def filter_eco_friendly_items(items, min_score=0.6):
    eco_items = []
    for item in items:
        score = get_sustainability_score(item['title'], item['description'])
        if score >= min_score:
            eco_items.append(item)
    return eco_items
```

### Search Enhancement
```python
def search_by_category(items, target_category):
    results = []
    for item in items:
        categories = get_categories(item['title'], item['description'])
        if target_category in categories:
            results.append(item)
    return results
```

## File Structure

```
CraftConnect/
├── ml/
│   ├── __init__.py          # Package initialization
│   ├── auto_tagging.py      # Core tagging system
│   └── api.py               # API wrapper functions
├── requirements.txt         # Python dependencies
├── example_usage.py         # Usage examples
└── AUTO_TAGGING_README.md   # This documentation
```

## Performance Considerations

### Optimization Tips

1. **Batch Processing**: Use `AutoTagger.batch_tag_items()` for multiple items
2. **Caching**: Cache results for frequently accessed items
3. **Lightweight Scoring**: Use `get_sustainability_score()` for quick assessments
4. **Memory Management**: Create new AutoTagger instances for long-running processes

### Dependencies

**Required (built-in Python)**:
- `re`, `json`, `typing`, `dataclasses`, `datetime`

**Optional (for enhanced accuracy)**:
- `nltk`: Better text preprocessing and tokenization
- `scikit-learn`: Advanced text analysis capabilities
- `pandas`, `numpy`: Data processing optimization

## Customization

### Adding New Categories
```python
# In AutoTagger.__init__()
self.craft_categories['new_category'] = ['keyword1', 'keyword2', 'keyword3']
```

### Modifying Sustainability Scoring
```python
# Adjust scoring weights in calculate_eco_impact_score()
if category == 'recycled':
    base_score += 0.25  # Increase recycled materials bonus
```

### Custom Price Categories
```python
# Modify price ranges in __init__()
self.price_categories['custom_range'] = (100, 300)
```

## API Response Format

```json
{
    \"categories\": [\"textiles\", \"fiber_arts\"],
    \"materials\": [\"cotton\", \"wool\"],
    \"sustainability_tags\": [\"organic\", \"fair_trade\", \"handmade\"],
    \"eco_impact_score\": 0.75,
    \"price_category\": \"affordable\",
    \"extracted_features\": {
        \"word_count\": 25,
        \"has_location\": true,
        \"has_artisan\": true,
        \"material_count\": 2
    },
    \"confidence_scores\": {
        \"categories\": {\"textiles\": 0.3, \"fiber_arts\": 0.2},
        \"eco_impact\": 0.75,
        \"overall\": 0.25
    }
}
```

## Testing

Run the demo to see the system in action:
```bash
# Core system demo
python ml/auto_tagging.py

# Comprehensive examples
python example_usage.py
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure you're running from the CraftConnect directory
2. **Missing Dependencies**: Install requirements with `pip install -r requirements.txt`
3. **Low Confidence Scores**: Add more descriptive keywords to item descriptions
4. **Category Misclassification**: Review and expand category keyword lists

### Performance Issues

1. **Slow Processing**: Install optional dependencies (`nltk`, `sklearn`)
2. **Memory Usage**: Use batch processing for large datasets
3. **Accuracy**: Provide more detailed item descriptions

## Future Enhancements

- **Machine Learning Models**: Train custom models on craft-specific data
- **Image Analysis**: Integrate computer vision for image-based tagging
- **Multi-language Support**: Support for non-English descriptions  
- **Real-time API**: RESTful API service for web integration
- **Database Integration**: Direct database connectivity options

## Support

For questions or issues:
1. Review this documentation
2. Check the `example_usage.py` file for implementation examples
3. Examine the demo output from `ml/auto_tagging.py`

The system is designed to work out-of-the-box with basic text processing and gracefully enhance when optional ML libraries are available.