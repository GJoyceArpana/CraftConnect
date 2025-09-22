# 🌿 CraftConnect - AI-Powered Sustainable Craft Marketplace

**CraftConnect** is an innovative AI-powered auto-tagging system designed specifically for sustainable craft marketplaces. It automatically analyzes craft products and provides intelligent categorization, sustainability scoring, market insights, and pricing recommendations.

![CraftConnect Demo](https://img.shields.io/badge/Status-Hackathon%20Ready-brightgreen) ![Python](https://img.shields.io/badge/Python-3.8%2B-blue) ![Flask](https://img.shields.io/badge/Flask-2.0%2B-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 **Features**

### 🤖 **AI-Powered Auto-Tagging**
- **Smart Categorization**: Automatically detect craft categories (jewelry, textiles, pottery, etc.)
- **Material Recognition**: Extract and categorize materials used
- **Sustainability Scoring**: Calculate eco-impact scores (0-100) based on materials and practices
- **Price Analysis**: Categorize pricing and suggest optimal price ranges

### 🌱 **Advanced Sustainability Analysis**
- **Eco-Impact Scoring**: Comprehensive sustainability assessment
- **Green Material Detection**: Identify recycled, organic, and renewable materials
- **Fair Trade Recognition**: Detect ethically sourced products
- **Carbon Footprint Indicators**: Assess environmental impact

### 📊 **Enhanced ML Features**
- **Sentiment Analysis**: Analyze product description sentiment
- **Market Potential Assessment**: Evaluate demand and premium potential  
- **Seasonal Trend Detection**: Identify seasonal relevance
- **Target Audience Analysis**: Determine optimal customer segments
- **Price Prediction**: AI-driven optimal pricing recommendations

### 💡 **Real-Time Analytics & Insights**
- **Live Statistics**: Real-time usage analytics and performance metrics
- **Trend Analysis**: Historical data analysis and pattern recognition
- **Marketing Suggestions**: AI-generated marketing recommendations
- **Performance Monitoring**: System health and response time tracking

### 🎨 **Beautiful Web Interface**
- **Modern Dashboard**: Intuitive, responsive web interface
- **Live Demos**: Interactive examples with real-time results
- **Visual Analytics**: Charts and graphs for data visualization
- **Mobile Responsive**: Works perfectly on all devices

## 🛠 **Installation & Setup**

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/craftconnect.git
   cd craftconnect
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000` to access the dashboard

## 📡 **API Documentation**

### Base URL
```
http://localhost:5000/api
```

### Key Endpoints

#### 1. **Health Check**
```http
GET /api/health
```

#### 2. **Analyze Craft Product**
```http
POST /api/products/upload/form
Content-Type: multipart/form-data
```

**Form Fields:**
- `title` (required): Product title
- `description` (required): Product description  
- `price` (optional): Product price
- `artisan` (optional): Artisan name
- `location` (optional): Location
- `materials` (optional): Materials used
- `image` (optional): Product image file

**Response includes:**
- Categories detected
- Materials identified
- Sustainability score (0-1)
- Price category
- Enhanced analysis (sentiment, market potential, etc.)
- Marketing suggestions

#### 3. **Live Analytics**
```http
GET /api/analytics/live
```
Returns real-time usage statistics and insights.

## 🎯 **Demo & Examples**

### Interactive Dashboard
1. Visit `http://localhost:5000`
2. Try the live demo examples
3. Fill out the form with your own craft product
4. See instant AI analysis results

### Sample Analysis Results
```json
{
  "categories": ["textiles", "fiber_arts"],
  "materials": ["organic cotton", "natural dyes"],
  "sustainability_tags": ["organic", "handmade", "locally sourced"],
  "eco_impact_score": 0.85,
  "price_category": "mid_range",
  "enhanced_analysis": {
    "sentiment_analysis": {
      "sentiment_score": 0.8,
      "polarity": 0.6
    },
    "market_analysis": {
      "demand_score": 0.9,
      "premium_potential": 0.7
    },
    "marketing_suggestions": [
      "🌱 Highlight eco-friendly aspects",
      "🎯 Target environmentally conscious buyers",
      "📈 Leverage organic and handmade keywords"
    ]
  }
}
```

## 🧠 **Machine Learning Features**

### Core Auto-Tagging
- **8 Craft Categories**: jewelry, textiles, pottery, woodwork, metalwork, glasswork, leather, fiber_arts
- **Material Detection**: 25+ material keywords with smart extraction
- **Sustainability Assessment**: Multi-factor eco-impact calculation
- **Price Intelligence**: Dynamic pricing insights

### Advanced Analytics
- **Sentiment Analysis**: TextBlob-powered emotion detection
- **Seasonal Trends**: Identify seasonal product relevance
- **Market Potential**: Assess demand and premium positioning
- **Target Audience**: Age group and interest classification
- **Uniqueness Scoring**: Evaluate product distinctiveness

## 📊 **Real-Time Analytics**

### Live Statistics
- Total requests processed
- Success/failure rates
- Average processing time
- Unique user sessions
- Top categories and materials
- Sustainability score trends

### Performance Monitoring
- Response time tracking
- System resource usage
- Connection monitoring
- Error rate analysis

## 🏗 **Architecture**

```
CraftConnect/
├── app.py                      # Flask web application
├── dashboard.html              # Modern web dashboard
├── realtime_analytics.py       # Analytics & monitoring
├── ml/                         # ML modules
│   ├── auto_tagging.py        # Core AI engine
│   ├── enhanced_features.py    # Advanced ML features
│   └── api.py                 # ML API wrapper
├── static/                     # Web assets
│   ├── style.css              # Beautiful styling
│   └── dashboard.js           # Interactive features
└── uploads/                    # File storage
```

## 🚀 **Hackathon Ready Features**

✅ **Working Demo**: Full web interface with live examples  
✅ **AI Analysis**: Instant product categorization and insights  
✅ **Real-time Stats**: Live analytics dashboard  
✅ **Modern UI**: Beautiful, responsive design with animations  
✅ **API Ready**: Complete RESTful API with documentation  
✅ **Enhanced ML**: Advanced features like sentiment analysis  
✅ **Performance**: Fast response times and monitoring  
✅ **Scalable**: Modular architecture for easy expansion  

## 🎨 **Visual Features**

- **Animated Statistics**: Live counting animations and progress bars
- **Interactive Demos**: Click-to-load example products
- **Color-Coded Tags**: Visual categorization with different colors
- **Gradient Designs**: Modern styling with smooth gradients
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Loading Animations**: Smooth spinners and transitions
- **Particle Effects**: Subtle floating animations

## 🔧 **Customization**

### Add New Craft Categories
```python
# In ml/auto_tagging.py
self.craft_categories = {
    'your_category': ['keyword1', 'keyword2'],
    # ... existing categories
}
```

### Modify Sustainability Factors
```python
# In ml/enhanced_features.py
self.sustainability_weights = {
    'your_factor': 0.2,
    # ... existing factors
}
```

## 🤝 **Contributing**

We welcome contributions! Areas where you can help:
- 🧠 Improve ML accuracy
- 🎨 Enhance UI/UX design  
- 📊 Add analytics features
- 🔧 Optimize performance
- 📖 Improve documentation

## 📈 **Future Roadmap**

- 🔄 **Image Analysis**: Computer vision for product photos
- 🔄 **Database Integration**: Persistent data storage
- 🔄 **User Accounts**: Authentication and personalization
- 🔄 **Mobile App**: Native iOS/Android applications
- 🔄 **Advanced AI**: Deep learning models
- 🔄 **Blockchain**: Authenticity and provenance tracking

## 📞 **Support**

- **Issues**: Report bugs or request features
- **Documentation**: Comprehensive API docs
- **Demo**: Live interactive demonstration

---

<div align="center">

**Made with ❤️ for sustainable craftsmanship and innovation**

*Empowering artisans with AI-powered marketplace intelligence*

</div>
