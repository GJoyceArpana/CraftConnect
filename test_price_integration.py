#!/usr/bin/env python3
"""
Test script for price prediction integration
"""

import json
import requests
import sys
import os

# Add backend to path
sys.path.append('backend')

def test_price_service_direct():
    """Test the price prediction service directly"""
    print("=" * 60)
    print("Testing Price Prediction Service (Direct)")
    print("=" * 60)
    
    try:
        from backend.price_prediction_service import price_service
        
        # Test data
        test_product = {
            'base_material_price': 50.0,
            'dimensions': 120.5,  # e.g., cm²
            'hours_of_labor': 5.0,
            'transport_distance': 25.0,  # km
            'region': 'North',
            'category': 'pottery',
            'crafting_process': 'handmade'
        }
        
        print(f"Model loaded: {price_service.is_loaded}")
        print(f"Model path: {price_service.model_path}")
        print()
        
        # Test ML prediction
        prediction = price_service.predict_price(test_product)
        if prediction:
            print("✅ ML Prediction successful!")
            print(f"   Predicted price: ${prediction['predicted_price']}")
            print(f"   Price range: ${prediction['price_range']['min']} - ${prediction['price_range']['max']}")
            print(f"   Confidence: {prediction['confidence']}")
        else:
            print("❌ ML Prediction failed - model not available")
        
        print()
        
        # Test comprehensive suggestions
        suggestions = price_service.get_price_suggestions(50.0, test_product)
        print("✅ Price suggestions generated!")
        print(f"   Base price: ${suggestions['base_price']}")
        print(f"   Number of suggestions: {len(suggestions['suggestions'])}")
        
        for i, suggestion in enumerate(suggestions['suggestions'], 1):
            print(f"   {i}. {suggestion['name']}: ${suggestion['price']}")
            print(f"      Range: ${suggestion['range']['min']} - ${suggestion['range']['max']}")
            print(f"      Confidence: {suggestion['confidence']}")
            print(f"      Reasoning: {suggestion['reasoning']}")
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing price service: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoints():
    """Test the Flask API endpoints"""
    print("=" * 60)
    print("Testing Flask API Endpoints")
    print("=" * 60)
    
    base_url = "http://localhost:5000"
    
    # Test data
    test_data = {
        'base_material_price': 75.0,
        'dimensions': 150.0,
        'hours_of_labor': 8.0,
        'transport_distance': 30.0,
        'region': 'South',
        'category': 'textiles',
        'crafting_process': 'woven'
    }
    
    endpoints_to_test = [
        {
            'endpoint': '/price_model_status',
            'method': 'GET',
            'data': None
        },
        {
            'endpoint': '/predict_price',
            'method': 'POST',
            'data': test_data
        },
        {
            'endpoint': '/price_suggestions',
            'method': 'POST',
            'data': test_data
        }
    ]
    
    print("Note: This requires the Flask server to be running on localhost:5000")
    print("You can test these endpoints manually once you start the server.\n")
    
    for test in endpoints_to_test:
        print(f"📋 Test: {test['method']} {test['endpoint']}")
        
        if test['method'] == 'GET':
            print(f"   URL: {base_url}{test['endpoint']}")
        else:
            print(f"   URL: {base_url}{test['endpoint']}")
            print(f"   Data: {json.dumps(test['data'], indent=2)}")
        print()
    
    return True

def main():
    print("🧪 CraftConnect Price Prediction Integration Test")
    print("=" * 70)
    print()
    
    # Test direct service
    service_ok = test_price_service_direct()
    
    print()
    
    # Test API info
    api_ok = test_api_endpoints()
    
    print("=" * 70)
    if service_ok:
        print("✅ Integration successful! Price prediction functionality is ready.")
        print()
        print("Next steps:")
        print("1. Start the Flask server: python backend/app.py")
        print("2. Test the API endpoints using the URLs shown above")
        print("3. Integrate with your frontend application")
    else:
        print("❌ Integration failed. Please check the error messages above.")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
