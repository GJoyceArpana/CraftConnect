#!/usr/bin/env python3

import requests
import json

# Test the AI chat endpoint
def test_ai_chat():
    url = "http://127.0.0.1:5000/ai/chat"
    
    test_data = {
        "message": "How can I reduce the carbon footprint of my products?",
        "context": {
            "product_data": {
                "category": "textiles",
                "weight_g": 200,
                "packaging_weight_g": 25,
                "distance_km_to_market": 150,
                "percent_recycled_material": 60,
                "production_method": "handmade",
                "materials": "handmade paper"
            },
            "current_impact": {
                "carbon_footprint": 2.1,
                "sustainability_score": 65
            }
        }
    }
    
    try:
        print("Testing AI Chat endpoint...")
        response = requests.post(url, json=test_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

# Test the AI analysis endpoint
def test_ai_analysis():
    url = "http://127.0.0.1:5000/ai/analyze"
    
    test_data = {
        "product_data": {
            "category": "textiles",
            "weight_g": 200,
            "packaging_weight_g": 25,
            "distance_km_to_market": 150,
            "percent_recycled_material": 60,
            "production_method": "handmade",
            "materials": "handmade paper"
        },
        "current_impact": {
            "carbon_footprint": 2.1,
            "sustainability_score": 65
        }
    }
    
    try:
        print("\nTesting AI Analysis endpoint...")
        response = requests.post(url, json=test_data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Analysis: {result.get('analysis', 'No analysis found')[:200]}...")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

# Test the debug endpoint
def test_debug():
    url = "http://127.0.0.1:5000/ai/debug"
    
    try:
        print("\nTesting Debug endpoint...")
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Status: {result.get('status')}")
            print(f"Service Available: {result.get('service_available')}")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_debug()
    test_ai_analysis()
    test_ai_chat()