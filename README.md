# 🌱 CraftConnect - Sustainable Marketplace with Eco Impact Analysis

**CraftConnect** is a curated marketplace connecting eco-conscious buyers with Indian artisans, featuring **real-time CO₂ impact calculations** and **transparent sustainability scoring**.

![CraftConnect Banner](https://img.shields.io/badge/Platform-Sustainable%20Marketplace-green?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A8?style=for-the-badge&logo=python&logoColor=ffdd54)

## 🚀 Features

### 🌿 **Eco Impact Analysis System**
- **Real-time CO₂ Savings Calculation** - Compare artisan vs factory production
- **Dynamic Sustainability Scoring** (0-95%) based on:
  - Production methods (handmade, small-batch, factory)
  - Recycled material percentages
  - Transportation distance from artisans to market
  - Product weight and packaging impact
- **Environmental Benefits Tracking** - Support traditional communities while reducing industrial emissions

### 🎨 **Authentic Indian Crafts**
- **Handwoven Cotton Scarves** (Organic cotton, 37.8% sustainability)
- **Madhubani Paintings** (Natural dyes, 49.7% sustainability)
- **Channapatna Toy Cars** (Sustainable wood, 36.7% sustainability)
- **Kinhal Wooden Dolls** (Rosewood, natural colors)
- **Blue Pottery Bowls** (Natural clay, mineral glazes)
- **Bamboo Water Bottles** (85% recycled bamboo fiber)

### 💻 **Modern Tech Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Python Flask with CORS support
- **API**: RESTful endpoints for product management and eco predictions
- **Real-time Calculations**: Dynamic algorithm considering multiple environmental factors

## 🏗️ **Architecture**

```
CraftConnect/
├── frontend/           # React TypeScript application
│   ├── src/components/ # Eco impact and product components
│   ├── src/services/   # API integration layer
│   └── src/buyer/      # User management system
├── backend/            # Flask API server
│   ├── app.py          # Main API endpoints
│   └── estimator.py    # Eco impact calculation engine
└── tests/              # Sample sustainable product data
```

## 🔧 **Setup & Installation**

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/GJoyceArpana/CraftConnect.git
cd CraftConnect
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install flask flask-cors

# Start Flask API server
cd backend
python app.py
# API will run on http://127.0.0.1:5000
```

### 3. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start development server
npm run dev
# Frontend will run on http://localhost:5175
```

## 📱 **Usage**

### **View Eco Impact Analysis**
1. Visit http://localhost:5175
2. Click "🌿 **View Products & Eco Impact**"
3. Browse authentic Indian crafts
4. Click "**View Eco Impact**" on any product
5. See real-time CO₂ savings and sustainability scores

### **Add New Products**
1. Click "**Add Product**" button
2. Enter product details (weight, materials, distance, etc.)
3. See instant eco impact calculations
4. Save to database with API integration

### **API Endpoints**
- `GET /` - API status and endpoints
- `GET /products` - List all sustainable products  
- `POST /products` - Add new product with eco data
- `POST /predict` - Calculate eco impact for product parameters

## 🧮 **Eco Impact Algorithm**

The sustainability scoring considers:

### **Carbon Footprint Calculation**
```python
# Factory production impact
factory_co2 = (weight + packaging) * category_factor + transport_impact

# Artisan/sustainable production impact  
artisan_co2 = (weight + packaging) * production_multiplier + reduced_transport

# CO₂ savings = difference between factory and sustainable production
co2_savings = factory_co2 - artisan_co2
```

### **Sustainability Score Factors**
- **Recycled Materials** (0-40 points): Higher percentage = higher score
- **Production Method Bonus**: 
  - Handmade: +35 points
  - Small-batch: +20 points  
  - Factory: +0 points
- **Distance Penalty**: Longer shipping = lower sustainability
- **Weight Penalty**: Heavier products = higher environmental impact

## 🎯 **Sustainability Impact Examples**

| Product | Method | Recycled % | CO₂ Saved | Sustainability |
|---------|--------|------------|-----------|----------------|
| Bamboo Bottle | Handmade | 85% | 1.2kg | 78% ✅ |
| Cotton Scarf | Handmade | 15% | 0.65kg | 38% 🟡 |
| Toy Car (Factory) | Factory | 5% | 2.1kg | 12% ❌ |

## 🌍 **Environmental Benefits**

- ♻️ **Supports sustainable material usage**
- 🏭 **Reduces industrial manufacturing emissions**
- 🎨 **Empowers traditional artisan communities**  
- 📦 **Minimizes packaging waste through local sourcing**
- 🚚 **Promotes shorter supply chains**

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Indian Artisan Communities** - For preserving traditional sustainable crafts
- **Environmental Impact Research** - For sustainable production methodologies  
- **Open Source Community** - For the amazing tools that made this possible

---

**🌱 Made with sustainability in mind | 🇮🇳 Supporting Indian artisans | 💚 Transparent environmental impact**
