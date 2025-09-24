#!/usr/bin/env python3
"""
Test script for Gemini AI integration
"""
import os
import sys
from dotenv import load_dotenv
from gemini_service import GeminiChatbotService

def test_gemini_connection():
    """Test basic Gemini API connection"""
    print("🚀 Testing Gemini 2.0 API Connection...")
    
    # Load environment variables
    load_dotenv()
    
    # Check if API key is available
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ No GEMINI_API_KEY found in environment")
        return False
    else:
        print(f"✅ API Key found: {api_key[:10]}...")
    
    try:
        # Initialize Gemini service
        gemini_service = GeminiChatbotService()
        print("✅ Gemini service initialized successfully")
        
        # Test basic chat functionality
        print("\n🧪 Testing basic chat...")
        test_message = "How can I make my textile products more sustainable?"
        
        response = gemini_service.chat_with_user(test_message)
        
        if response.get('success'):
            print("✅ Chat test successful!")
            print(f"AI Response: {response['response'][:150]}...")
            if response.get('suggestions'):
                print(f"✅ Got {len(response['suggestions'])} actionable suggestions")
        else:
            print(f"❌ Chat test failed: {response.get('error', 'Unknown error')}")
            return False
        
        # Test carbon footprint analysis
        print("\n🧪 Testing carbon footprint analysis...")
        test_product = {
            'category': 'textiles',
            'weight_g': 200,
            'packaging_weight_g': 50,
            'distance_km_to_market': 150,
            'percent_recycled_material': 40,
            'production_method': 'handmade',
            'materials': 'cotton'
        }
        
        test_impact = {
            'carbon_footprint': 1.8,
            'sustainability_score': 65.5
        }
        
        analysis = gemini_service.analyze_carbon_footprint(test_product, test_impact)
        
        if analysis.get('success'):
            print("✅ Carbon footprint analysis successful!")
            print(f"Analysis preview: {analysis['analysis'][:100]}...")
            if analysis.get('suggestions'):
                print(f"✅ Got {len(analysis['suggestions'])} improvement suggestions")
        else:
            print(f"❌ Analysis failed: {analysis.get('error', 'Unknown error')}")
            return False
        
        # Test parameter suggestions
        print("\n🧪 Testing parameter optimization...")
        param_suggestions = gemini_service.get_parameter_suggestions(test_product, "sustainability")
        
        if param_suggestions.get('success'):
            print("✅ Parameter suggestions successful!")
            print(f"Suggestions preview: {param_suggestions['parameter_suggestions'][:100]}...")
        else:
            print(f"❌ Parameter suggestions failed: {param_suggestions.get('error', 'Unknown error')}")
            return False
        
        print("\n🎉 All tests passed! Gemini 2.0 integration is working correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        return False

def test_mock_mode():
    """Test that mock mode works when no API key is provided"""
    print("\n🧪 Testing mock mode (without API key)...")
    
    # Temporarily remove API key
    original_key = os.environ.get('GEMINI_API_KEY')
    if 'GEMINI_API_KEY' in os.environ:
        del os.environ['GEMINI_API_KEY']
    
    try:
        gemini_service = GeminiChatbotService()
        response = gemini_service.chat_with_user("How can I be more sustainable?")
        
        if response.get('success'):
            print("✅ Mock mode working correctly!")
            print(f"Mock response: {response['response'][:100]}...")
        else:
            print("❌ Mock mode failed")
        
    except Exception as e:
        print(f"❌ Mock mode error: {str(e)}")
    finally:
        # Restore API key
        if original_key:
            os.environ['GEMINI_API_KEY'] = original_key

if __name__ == "__main__":
    print("🌱 CraftConnect Gemini 2.0 Integration Test\n")
    
    success = test_gemini_connection()
    
    # Test mock mode
    test_mock_mode()
    
    if success:
        print("\n✅ Integration ready! You can now:")
        print("  • Start the Flask backend: python app.py")
        print("  • Use the chatbot in your React frontend")
        print("  • Get AI-powered sustainability recommendations")
        sys.exit(0)
    else:
        print("\n❌ Integration test failed. Please check the errors above.")
        sys.exit(1)