# Gemini 2.0 Chatbot Integration for CraftConnect

This document explains the comprehensive Gemini 2.0 AI chatbot integration for sustainability recommendations and carbon footprint optimization in CraftConnect.

## 🌟 Features Added

### 1. **Gemini 2.0 Chatbot Service** (`backend/gemini_service.py`)
- Full integration with Google's Gemini 2.0 Flash model
- Sustainability-focused AI assistant with specialized prompts
- Carbon footprint analysis and improvement recommendations
- Parameter optimization suggestions
- Context-aware conversations with product data
- Fallback responses for development/testing

### 2. **Interactive Chat Component** (`src/components/SustainabilityChatbot.tsx`)
- Modern, responsive chat interface
- Quick action buttons for common tasks
- Real-time AI conversations
- Actionable suggestion buttons
- Minimizable/expandable design
- Error handling with graceful fallbacks

### 3. **Enhanced Backend API** (`backend/app.py`)
- New AI endpoints:
  - `/ai/chat` - General sustainability chat
  - `/ai/analyze` - Detailed carbon footprint analysis
  - `/ai/parameter-suggestions` - Parameter optimization
  - `/ai/quick-tips` - Category-specific tips
- Integration with existing carbon footprint calculations
- Optional AI recommendations in prediction results

### 4. **Sustainability Recommendations Engine** (`src/services/sustainabilityEngine.ts`)
- Intelligent analysis of product sustainability metrics
- Category-specific improvement suggestions
- Parameter optimization algorithms
- Priority action identification
- Impact simulation and modeling
- Quick sustainability tips

### 5. **Enhanced EcoImpact Component**
- Integrated AI recommendations display
- Priority actions highlighting
- Potential impact preview
- Direct chatbot access
- Seamless user experience

## 🚀 Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env` file

4. **Start Backend**
   ```bash
   python app.py
   ```

### 2. Frontend Setup

The frontend components are already integrated and will work automatically with the backend.

## 💡 How to Use

### For Users (Artisans/Sellers)

1. **Calculate Carbon Footprint**
   - Enter your product details
   - Get instant sustainability analysis
   - View AI-generated improvement suggestions

2. **Chat with AI Assistant**
   - Click "Get AI Sustainability Advice" button
   - Ask questions about improving your products
   - Get personalized recommendations

3. **Quick Actions**
   - **Analyze My Product**: Get detailed sustainability analysis
   - **How to Improve**: Receive specific improvement suggestions
   - **Material Tips**: Learn about eco-friendly materials
   - **Reduce CO2**: Get carbon reduction strategies

4. **Apply Suggestions**
   - Click on actionable suggestions in chat
   - Get detailed implementation guidance
   - See potential impact predictions

### For Buyers

1. **Product Analysis**
   - View carbon footprint data on products
   - See sustainability scores and AI recommendations
   - Make informed purchasing decisions

2. **Ask Questions**
   - Chat with AI about sustainable products
   - Learn about environmental impact
   - Get tips for eco-friendly purchasing

## 🔧 API Endpoints

### Chat Endpoints

- **POST `/ai/chat`**
  ```json
  {
    "message": "How can I reduce carbon footprint?",
    "context": {
      "product_data": {...},
      "conversation_history": "..."
    }
  }
  ```

- **POST `/ai/analyze`**
  ```json
  {
    "product_data": {...},
    "current_impact": {...}
  }
  ```

- **POST `/ai/parameter-suggestions`**
  ```json
  {
    "current_params": {...},
    "target_improvement": "overall"
  }
  ```

- **POST `/ai/quick-tips`**
  ```json
  {
    "category": "textiles"
  }
  ```

### Enhanced Prediction Endpoint

- **POST `/predict`** or **POST `/carbon_footprint`**
  ```json
  {
    "category": "textiles",
    "weight_g": 200,
    "packaging_weight_g": 50,
    "distance_km_to_market": 150,
    "percent_recycled_material": 60,
    "production_method": "handmade",
    "include_recommendations": true
  }
  ```

## 🎯 Key Capabilities

### 1. **Intelligent Analysis**
- Contextual understanding of sustainability metrics
- Category-specific recommendations
- Impact prediction and modeling
- Priority action identification

### 2. **Parameter Optimization**
- Suggests specific parameter changes
- Quantifies expected improvements
- Provides implementation guidance
- Cost-benefit analysis

### 3. **Conversational AI**
- Natural language interaction
- Context-aware responses
- Educational content delivery
- Encouragement and support

### 4. **Practical Recommendations**
- Actionable improvement suggestions
- Cost-effective solutions
- Traditional craft-friendly approaches
- Step-by-step implementation guides

## 🌱 Example Interactions

### Typical User Questions:
- "How can I improve my sustainability score?"
- "What materials should I use for better environmental impact?"
- "How to reduce packaging weight without affecting quality?"
- "What's the best production method for my product category?"

### AI Responses Include:
- Specific parameter changes with expected impact
- Implementation steps and resources
- Cost considerations for small artisans
- Traditional vs. modern sustainable practices
- Quantified improvements (e.g., "+15% sustainability score")

## 🔒 Development Mode

When `GEMINI_API_KEY` is not set, the system runs in development mode with:
- Mock AI responses that are still contextually relevant
- Comprehensive fallback suggestions
- Full feature testing capability
- No API costs during development

## 📊 Impact Metrics

The AI system provides:
- **Carbon Footprint Reduction**: Up to 2kg CO2 savings
- **Sustainability Score Improvement**: Up to 40% increase
- **Parameter Optimization**: Specific value suggestions
- **Implementation Guidance**: Step-by-step instructions
- **Cost Analysis**: Low/medium/high cost categorization

## 🛠️ Troubleshooting

### Common Issues:

1. **"AI service not available"**
   - Check GEMINI_API_KEY in .env file
   - Verify API key is valid
   - System will fallback to mock responses

2. **Chat not responding**
   - Check backend server is running
   - Verify network connectivity
   - Look for error messages in browser console

3. **Recommendations not showing**
   - Ensure product data is complete
   - Check that include_recommendations=true
   - Verify backend endpoints are working

## 🔄 Future Enhancements

Potential improvements for future versions:
- Multi-language support
- Voice chat capabilities
- Image analysis integration
- Collaborative recommendation sharing
- Advanced analytics and reporting
- Integration with sustainability certifications

## 📞 Support

For technical issues or questions about the Gemini integration:
1. Check the browser console for error messages
2. Verify backend logs for API issues
3. Ensure all dependencies are installed
4. Test with development mode first

---

The Gemini 2.0 integration transforms CraftConnect into an intelligent sustainability platform, providing personalized AI guidance for artisans and buyers to make more environmentally conscious decisions.