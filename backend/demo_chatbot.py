#!/usr/bin/env python3
"""
Demo script showing Gemini 2.0 chatbot capabilities for CraftConnect
"""
import os
from dotenv import load_dotenv
from gemini_service import GeminiChatbotService

def demo_sustainability_chat():
    """Demo the sustainability chatbot with realistic scenarios"""
    
    # Load environment
    load_dotenv()
    
    # Initialize Gemini service
    print("🤖 Initializing CraftConnect AI Sustainability Assistant...\n")
    gemini_service = GeminiChatbotService()
    
    # Sample product data
    textile_product = {
        'category': 'textiles',
        'weight_g': 250,
        'packaging_weight_g': 60,
        'distance_km_to_market': 280,
        'percent_recycled_material': 35,
        'production_method': 'small-batch',
        'materials': 'cotton'
    }
    
    current_impact = {
        'carbon_footprint': 2.3,
        'sustainability_score': 58.5
    }
    
    print("📊 Product Details:")
    print(f"   Category: {textile_product['category']}")
    print(f"   Weight: {textile_product['weight_g']}g")
    print(f"   Recycled Content: {textile_product['percent_recycled_material']}%")
    print(f"   Production: {textile_product['production_method']}")
    print(f"   Current CO2 Footprint: {current_impact['carbon_footprint']}kg")
    print(f"   Sustainability Score: {current_impact['sustainability_score']}%")
    
    # Demo different chatbot scenarios
    scenarios = [
        {
            "title": "💬 General Sustainability Question",
            "message": "How can I make my textile products more sustainable?",
            "context": {"product_data": textile_product}
        },
        {
            "title": "🎯 Specific Parameter Question", 
            "message": "My recycled content is only 35%. How much should I increase it and what impact will that have?",
            "context": {"product_data": textile_product, "current_impact": current_impact}
        },
        {
            "title": "📦 Packaging Optimization",
            "message": "My packaging weighs 60g. Is this too much and how can I reduce it?",
            "context": {"product_data": textile_product}
        },
        {
            "title": "🚚 Transportation Concerns",
            "message": "I'm shipping 280km to market. What are my options to reduce emissions?",
            "context": {"product_data": textile_product}
        }
    ]
    
    # Run demo scenarios
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{'='*60}")
        print(f"{scenario['title']}")
        print(f"User: {scenario['message']}")
        print("-" * 60)
        
        try:
            response = gemini_service.chat_with_user(
                scenario['message'], 
                scenario['context']
            )
            
            if response.get('success'):
                print(f"🤖 AI Assistant: {response['response']}")
                
                if response.get('suggestions'):
                    print(f"\n💡 Actionable Suggestions ({len(response['suggestions'])}):")
                    for j, suggestion in enumerate(response['suggestions'][:3], 1):
                        print(f"   {j}. {suggestion}")
            else:
                print(f"❌ Error: {response.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Demo error: {str(e)}")
    
    # Demo parameter optimization
    print(f"\n{'='*60}")
    print("🔧 AI Parameter Optimization Demo")
    print("-" * 60)
    
    try:
        optimization = gemini_service.get_parameter_suggestions(
            textile_product, 
            "overall"
        )
        
        if optimization.get('success'):
            print("🤖 AI Parameter Optimizer:")
            print(optimization['parameter_suggestions'])
            
            if optimization.get('parsed_changes'):
                print(f"\n📈 Identified Parameter Changes:")
                for param, change in optimization['parsed_changes'].items():
                    print(f"   • {param}: {change.get('impact', 'Improvement available')}")
        else:
            print(f"❌ Error: {optimization.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Optimization demo error: {str(e)}")
    
    # Demo carbon footprint analysis
    print(f"\n{'='*60}")
    print("📊 AI Carbon Footprint Analysis Demo")
    print("-" * 60)
    
    try:
        analysis = gemini_service.analyze_carbon_footprint(
            textile_product,
            current_impact
        )
        
        if analysis.get('success'):
            print("🤖 AI Carbon Analyst:")
            # Show first 300 characters of analysis
            analysis_preview = analysis['analysis'][:300]
            if len(analysis['analysis']) > 300:
                analysis_preview += "..."
            print(analysis_preview)
            
            if analysis.get('suggestions'):
                print(f"\n🎯 Priority Improvements ({len(analysis['suggestions'])}):")
                for j, suggestion in enumerate(analysis['suggestions'][:3], 1):
                    print(f"   {j}. {suggestion.get('description', 'Improvement available')}")
        else:
            print(f"❌ Error: {analysis.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Analysis demo error: {str(e)}")
    
    print(f"\n{'='*60}")
    print("🎉 Demo Complete!")
    print("\nThe AI chatbot can now:")
    print("  ✅ Answer sustainability questions")
    print("  ✅ Suggest specific parameter changes")
    print("  ✅ Provide quantified impact predictions")
    print("  ✅ Give implementation guidance")
    print("  ✅ Analyze carbon footprints intelligently")
    print("  ✅ Work with or without internet (fallback mode)")
    print(f"{'='*60}")

if __name__ == "__main__":
    demo_sustainability_chat()