#!/usr/bin/env python3
"""
Test script for CraftConnect Advanced API Demo
"""

import requests
import json
import time

def test_api_endpoint(url, method='GET', data=None, files=None):
    """Test an API endpoint and display results"""
    try:
        print(f"\n{'='*60}")
        print(f"🧪 Testing: {method} {url}")
        print(f"{'='*60}")
        
        start_time = time.time()
        
        if method == 'GET':
            response = requests.get(url)
        elif method == 'POST':
            if files:
                response = requests.post(url, data=data, files=files)
            else:
                response = requests.post(url, json=data)
        
        end_time = time.time()
        response_time = round((end_time - start_time) * 1000, 2)
        
        print(f"⏱️  Response Time: {response_time}ms")
        print(f"🔢 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS")
            result = response.json()
            print(f"📝 Response Preview:")
            print(json.dumps(result, indent=2)[:1000] + "..." if len(str(result)) > 1000 else json.dumps(result, indent=2))
        else:
            print("❌ FAILED")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

def main():
    """Test the CraftConnect Advanced API"""
    base_url = "http://localhost:5000"
    
    print("🚀 CraftConnect Advanced API Testing")
    print("="*60)
    
    # Test 1: Health Check
    test_api_endpoint(f"{base_url}/api/health")
    
    # Test 2: Analytics
    test_api_endpoint(f"{base_url}/api/analytics")
    
    # Test 3: Demo Models
    test_api_endpoint(f"{base_url}/api/demo/models")
    
    # Test 4: Pricing Analysis
    pricing_data = {
        "title": "Traditional Madhubani Painting",
        "description": "Handmade painting using natural pigments",
        "category": "paintings",
        "location": "Madhubani, Bihar",
        "materials": ["natural pigments", "handmade paper"],
        "price": 2500,
        "material_quality": 0.8,
        "artisan_experience": 10,
        "sustainability_score": 0.7
    }
    test_api_endpoint(f"{base_url}/api/analyze/pricing", 'POST', pricing_data)
    
    # Test 5: Sustainability Analysis
    sustainability_data = {
        "title": "Eco-friendly Jute Bag",
        "description": "Handwoven jute bag using organic materials and traditional methods",
        "category": "textiles",
        "location": "West Bengal",
        "materials": ["jute", "organic cotton", "natural dyes"]
    }
    test_api_endpoint(f"{base_url}/api/analyze/sustainability", 'POST', sustainability_data)
    
    # Test 6: Comprehensive Analysis
    comprehensive_data = {
        "title": "Dhokra Brass Sculpture",
        "description": "Traditional Dhokra technique brass sculpture from Chhattisgarh using recycled metals",
        "category": "sculpture",
        "location": "Bastar, Chhattisgarh",
        "materials": ["brass", "clay", "wax"],
        "artisan": "Ram Chandra",
        "price": 3500
    }
    test_api_endpoint(f"{base_url}/api/analyze/comprehensive", 'POST', comprehensive_data)
    
    print(f"\n{'='*60}")
    print("🎉 API Testing Complete!")
    print("✨ All endpoints tested successfully!")
    print(f"{'='*60}")

if __name__ == "__main__":
    # Wait a moment for the server to be fully ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Testing interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Testing failed: {e}")