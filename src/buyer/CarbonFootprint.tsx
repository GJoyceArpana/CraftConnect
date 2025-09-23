import React, { useState, useEffect } from 'react';
import { carbonFootprintService, ProductEcoData, EcoImpactResult } from '../services/carbonFootprintService';

type User = {
  id?: string | number;
  name?: string;
  phone?: string;
  type?: string;
};

type CarbonFootprintProps = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onBack: () => void;
};

const CarbonFootprint: React.FC<CarbonFootprintProps> = ({ user, onNavigate, onBack }) => {
  const [ecoSummary, setEcoSummary] = useState({
    totalCO2Saved: 0,
    averageSustainabilityScore: 0,
    totalProducts: 0,
    topCategory: 'textiles'
  });
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductEcoData | null>(null);
  const [productImpact, setProductImpact] = useState<EcoImpactResult | null>(null);
  const [calculatingImpact, setCalculatingImpact] = useState(false);

  // Sample user purchase history (in real app, this would come from user data/orders)
  const userPurchases: ProductEcoData[] = [
    {
      weight_g: 800,
      packaging_weight_g: 50,
      distance_km_to_market: 150,
      category: 'terracotta',
      percent_recycled_material: 30,
      production_method: 'handmade'
    },
    {
      weight_g: 200,
      packaging_weight_g: 20,
      distance_km_to_market: 100,
      category: 'jute',
      percent_recycled_material: 60,
      production_method: 'handmade'
    },
    {
      weight_g: 500,
      packaging_weight_g: 30,
      distance_km_to_market: 200,
      category: 'textiles',
      percent_recycled_material: 40,
      production_method: 'handmade'
    },
    {
      weight_g: 300,
      packaging_weight_g: 25,
      distance_km_to_market: 120,
      category: 'bamboo',
      percent_recycled_material: 50,
      production_method: 'handmade'
    }
  ];

  const productOptions = [
    { 
      name: 'Handcrafted Terracotta Vase', 
      data: { 
        weight_g: 800, packaging_weight_g: 50, distance_km_to_market: 150, 
        category: 'terracotta', percent_recycled_material: 30, production_method: 'handmade' as const
      }
    },
    { 
      name: 'Organic Jute Shopping Bag', 
      data: { 
        weight_g: 200, packaging_weight_g: 20, distance_km_to_market: 100, 
        category: 'jute', percent_recycled_material: 60, production_method: 'handmade' as const
      }
    },
    { 
      name: 'Handwoven Cotton Throw', 
      data: { 
        weight_g: 500, packaging_weight_g: 30, distance_km_to_market: 200, 
        category: 'textiles', percent_recycled_material: 40, production_method: 'handmade' as const
      }
    },
    { 
      name: 'Bamboo Kitchen Set', 
      data: { 
        weight_g: 300, packaging_weight_g: 25, distance_km_to_market: 120, 
        category: 'bamboo', percent_recycled_material: 50, production_method: 'handmade' as const
      }
    }
  ];

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      // Check if backend is connected
      const isConnected = await carbonFootprintService.checkBackendHealth();
      setBackendConnected(isConnected);

      if (isConnected) {
        // Get user eco summary from backend
        const summary = await carbonFootprintService.getUserEcoSummary(userPurchases);
        setEcoSummary(summary);
      } else {
        // Fallback to mock data
        setEcoSummary({
          totalCO2Saved: 12.5,
          averageSustainabilityScore: 45.2,
          totalProducts: 8,
          topCategory: 'textiles'
        });
      }

      setLoading(false);
    };

    initializeData();
  }, []);

  const calculateProductImpact = async (productData: ProductEcoData) => {
    setCalculatingImpact(true);
    setSelectedProduct(productData);

    if (backendConnected) {
      const impact = await carbonFootprintService.calculateEcoImpact(productData);
      setProductImpact(impact);
    } else {
      // Mock calculation for demo
      setTimeout(() => {
        setProductImpact({
          carbon_footprint: Math.random() * 5 + 1,
          sustainability_score: Math.random() * 40 + 40
        });
      }, 1000);
    }

    setCalculatingImpact(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      terracotta: '🏺',
      jute: '👜',
      textiles: '🧵',
      bamboo: '🎋',
      toys: '🧸',
      painting: '🎨'
    };
    return icons[category] || '🛍️';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      terracotta: 'bg-orange-100 text-orange-800',
      jute: 'bg-green-100 text-green-800',
      textiles: 'bg-purple-100 text-purple-800',
      bamboo: 'bg-emerald-100 text-emerald-800',
      toys: 'bg-pink-100 text-pink-800',
      painting: 'bg-blue-100 text-blue-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#154731] mx-auto mb-4"></div>
          <p className="text-[#666]">Loading your eco impact data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-[#666] hover:text-[#333] font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-[#154731]">🌱 Your Carbon Footprint</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm ${backendConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {backendConnected ? '🟢 Backend Connected' : '🟡 Demo Mode'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dashboard-card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-3xl font-bold mb-2">{ecoSummary.totalCO2Saved} kg</div>
            <div className="text-green-100 text-sm">Total CO₂ Saved</div>
            <div className="text-xs text-green-200 mt-1">🌱 Equivalent to planting {Math.round(ecoSummary.totalCO2Saved * 0.16)} trees</div>
          </div>

          <div className="dashboard-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-3xl font-bold mb-2">{ecoSummary.averageSustainabilityScore}%</div>
            <div className="text-blue-100 text-sm">Avg. Sustainability Score</div>
            <div className="text-xs text-blue-200 mt-1">📊 Waste reduction compared to mass production</div>
          </div>

          <div className="dashboard-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-3xl font-bold mb-2">{ecoSummary.totalProducts}</div>
            <div className="text-purple-100 text-sm">Eco-Friendly Products</div>
            <div className="text-xs text-purple-200 mt-1">🛍️ Total sustainable purchases</div>
          </div>

          <div className="dashboard-card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="text-3xl font-bold mb-2">{getCategoryIcon(ecoSummary.topCategory)}</div>
            <div className="text-orange-100 text-sm">Top Category</div>
            <div className="text-xs text-orange-200 mt-1 capitalize">📈 Most purchased: {ecoSummary.topCategory}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Impact Calculator */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-[#333] mb-4">🧮 Eco Impact Calculator</h3>
            <p className="text-[#666] mb-4">Calculate the environmental impact of different craft products</p>
            
            <div className="space-y-4">
              {productOptions.map((product, index) => (
                <button
                  key={index}
                  onClick={() => calculateProductImpact(product.data)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#154731] hover:bg-green-50 transition-colors"
                  disabled={calculatingImpact}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getCategoryIcon(product.data.category)}</span>
                      <div>
                        <div className="font-medium text-[#333]">{product.name}</div>
                        <div className="text-xs text-[#666]">
                          {product.data.weight_g}g • {product.data.percent_recycled_material}% recycled • {product.data.production_method}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${getCategoryColor(product.data.category)}`}>
                      {product.data.category}
                    </div>
                  </div>
                </button>
              ))}

              {calculatingImpact && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#154731] mx-auto mb-2"></div>
                  <p className="text-sm text-[#666]">Calculating environmental impact...</p>
                </div>
              )}

              {productImpact && selectedProduct && !calculatingImpact && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Environmental Impact Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-green-600">CO₂ Savings</div>
                      <div className="font-bold text-green-800">{productImpact.carbon_footprint.toFixed(2)} kg</div>
                    </div>
                    <div>
                      <div className="text-green-600">Sustainability Score</div>
                      <div className="font-bold text-green-800">{productImpact.sustainability_score.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 mt-2">
                    Compared to mass-produced alternatives
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Your Purchase History Impact */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-[#333] mb-4">🛍️ Your Purchase Impact</h3>
            <p className="text-[#666] mb-4">Environmental impact of your recent purchases</p>
            
            <div className="space-y-3">
              {userPurchases.map((purchase, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(purchase.category)}</span>
                      <div>
                        <div className="font-medium text-[#333] capitalize">{purchase.category} Product</div>
                        <div className="text-xs text-[#666]">
                          {purchase.weight_g}g • {purchase.percent_recycled_material}% recycled
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${getCategoryColor(purchase.category)}`}>
                      {purchase.production_method}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">
                      Estimated CO₂ saved: ~{(Math.random() * 3 + 0.5).toFixed(1)} kg
                    </div>
                    <div className="text-blue-600">
                      Distance: {purchase.distance_km_to_market} km
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800 mb-1">Great Job!</div>
                <div className="text-sm text-blue-700">
                  Your sustainable purchases have saved approximately <strong>{ecoSummary.totalCO2Saved} kg of CO₂</strong>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  Keep buying eco-friendly products to increase your positive environmental impact! 🌍
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for Reducing Carbon Footprint */}
        <div className="mt-8 dashboard-card">
          <h3 className="text-lg font-semibold text-[#333] mb-4">💡 Tips for Reducing Your Carbon Footprint</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold mb-2">🌱 Choose Handmade</div>
              <div className="text-sm text-green-700">
                Handcrafted products typically use less energy and create fewer emissions than mass-produced items.
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold mb-2">♻️ Buy Recycled</div>
              <div className="text-sm text-blue-700">
                Products made from recycled materials reduce waste and require less energy to produce.
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold mb-2">📦 Local Sourcing</div>
              <div className="text-sm text-purple-700">
                Choose products from local artisans to reduce transportation emissions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprint;