from dotenv import load_dotenv
from gemini_service import GeminiChatbotService

load_dotenv()
gemini = GeminiChatbotService()

# Test simple chat
response = gemini.chat_with_user(
    "How can I increase my recycled content from 35% to 60%?", 
    {
        "product_data": {
            "category": "textiles",
            "weight_g": 250,
            "percent_recycled_material": 35,
            "production_method": "handmade",
            "materials": "cotton"
        },
        "current_impact": {
            "carbon_footprint": 2.3,
            "sustainability_score": 58.5
        }
    }
)

if response.get('success'):
    print("✅ Chat working!")
    print(f"AI: {response['response'][:200]}...")
    if response.get('suggestions'):
        print(f"Suggestions: {len(response['suggestions'])}")
else:
    print(f"❌ Error: {response}")