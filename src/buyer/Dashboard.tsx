// src/BuyerDashboard.tsx
import { useState } from 'react';
import type { FC } from 'react';
import CarbonFootprintBadge, { CarbonFootprintCard } from '../components/CarbonFootprintBadge';
import SustainabilityChatbot from '../components/SustainabilityChatbot';
import { apiService } from '../services/api';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  co2Saved: number; // for backward compatibility
  co2SavingKg?: number; // new field from API
  sustainabilityScore?: number;
  wasteReductionPct?: number;
  category: string;
  image: string;
};

type CartItem = Product & { quantity: number };

type User = {
  id?: string | number;
  name?: string;
  phone?: string;
  profileImage?: string;
  email?: string;
  address?: string; // <-- added address
};

type BuyerDashboardProps = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

const CarbonFootprintModal: FC<{
  user?: User | null;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [currentView, setCurrentView] = useState<'form' | 'impact'>('form');
  const [productForm, setProductForm] = useState({
    weight: 200,
    materials: 'handmade paper',
    percentRecycled: 60,
    productionMethod: 'handmade',
    distanceToMarket: 150,
    packagingWeight: 20
  });
  const [calculatedImpact, setCalculatedImpact] = useState<{
    carbonSaved: number;
    sustainabilityScore: number;
  } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleCalculateImpact = async () => {
    try {
      const result = await apiService.predictEcoImpact({
        weight_g: productForm.weight,
        packaging_weight_g: productForm.packagingWeight,
        distance_km_to_market: productForm.distanceToMarket,
        percent_recycled_material: productForm.percentRecycled,
        production_method: productForm.productionMethod,
        category: 'textiles',
        include_recommendations: true
      });
      
      if (result.data) {
        setCalculatedImpact({
          carbonSaved: result.data.carbon_footprint,
          sustainabilityScore: result.data.sustainability_score
        });
      } else if (result.error) {
        console.error('API Error:', result.error);
        // Fallback calculation
        setCalculatedImpact({
          carbonSaved: (productForm.weight / 1000) * 2.5,
          sustainabilityScore: productForm.percentRecycled * 0.8
        });
      }
    } catch (error) {
      console.error('Error calculating impact:', error);
      setCalculatedImpact({
        carbonSaved: (productForm.weight / 1000) * 2.5,
        sustainabilityScore: productForm.percentRecycled * 0.8
      });
    }
  };

  const handleSaveProduct = () => {
    if (calculatedImpact && user?.id) {
      try {
        const newProductData = {
          id: Date.now(),
          name: `Eco Product - ${productForm.materials}`,
          ...productForm,
          carbonSaved: calculatedImpact.carbonSaved,
          sustainabilityScore: calculatedImpact.sustainabilityScore,
          createdAt: new Date().toISOString(),
          buyerId: user.id
        };

        const existingHistory = JSON.parse(localStorage.getItem('cc_carbon_history') || '[]');
        existingHistory.push(newProductData);
        localStorage.setItem('cc_carbon_history', JSON.stringify(existingHistory));

        const userImpact = JSON.parse(localStorage.getItem(`cc_user_impact_${user.id}`) || '{}');
        userImpact.totalCO2Saved = (userImpact.totalCO2Saved || 0) + calculatedImpact.carbonSaved;
        userImpact.totalProducts = (userImpact.totalProducts || 0) + 1;
        userImpact.lastUpdated = new Date().toISOString();
        localStorage.setItem(`cc_user_impact_${user.id}`, JSON.stringify(userImpact));
        
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setCurrentView('impact');
          setProductForm({
            weight: 200,
            materials: 'handmade paper',
            percentRecycled: 60,
            productionMethod: 'handmade',
            distanceToMarket: 150,
            packagingWeight: 20
          });
          setCalculatedImpact(null);
        }, 2000);
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product. Please try again.');
      }
    }
  };

  // Load carbon footprint data from localStorage
  const getUserCarbonData = () => {
    try {
      const userImpact = JSON.parse(localStorage.getItem(`cc_user_impact_${user?.id}`) || '{}');
      const carbonHistory = JSON.parse(localStorage.getItem('cc_carbon_history') || '[]')
        .filter((item: any) => item.buyerId === user?.id);
      
      const totalCO2Saved = userImpact.totalCO2Saved || carbonHistory.reduce((sum: number, item: any) => sum + (item.carbonSaved || 0), 0) || 12.5;
      const treesEquivalent = Math.round(totalCO2Saved / 6.25);
      const wasteReduced = totalCO2Saved * 1.2;
      
      return {
        totalCO2Saved,
        monthlyData: [
          { month: 'Jan', co2Saved: 2.1, orders: 2 },
          { month: 'Feb', co2Saved: 1.8, orders: 1 },
          { month: 'Mar', co2Saved: 3.2, orders: 3 },
          { month: 'Apr', co2Saved: 2.7, orders: 2 },
          { month: 'May', co2Saved: 2.7, orders: 3 }
        ],
        impactComparison: {
          treesPlanted: Math.max(treesEquivalent, 2),
          factoryProductsAvoided: carbonHistory.length * 2 || 8,
          wasteReduced: Math.round(wasteReduced * 10) / 10 || 15.2
        }
      };
    } catch (error) {
      return {
        totalCO2Saved: 12.5,
        monthlyData: [
          { month: 'Jan', co2Saved: 2.1, orders: 2 },
          { month: 'Feb', co2Saved: 1.8, orders: 1 },
          { month: 'Mar', co2Saved: 3.2, orders: 3 },
          { month: 'Apr', co2Saved: 2.7, orders: 2 },
          { month: 'May', co2Saved: 2.7, orders: 3 }
        ],
        impactComparison: {
          treesPlanted: 2,
          factoryProductsAvoided: 8,
          wasteReduced: 15.2
        }
      };
    }
  };

  const carbonData = getUserCarbonData();

  return (
    <div className="modal-overlay fixed inset-0 z-60 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="modal-content bg-[#2a2a2b] text-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold">🌱 Your Carbon Footprint Impact</h3>
            {currentView === 'impact' && (
              <button 
                onClick={() => setCurrentView('form')} 
                className="text-sm bg-[#d67a4a] hover:bg-[#c56a3a] px-3 py-1 rounded-lg transition"
              >
                Add New Product
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-2xl hover:text-gray-400">×</button>
        </div>

        {currentView === 'form' ? (
          /* Product Input Form - Same as seller */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setCurrentView('impact')} 
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
              >
                ← View Your Impact
              </button>
              <button 
                onClick={() => setCurrentView('impact')} 
                className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-lg transition"
              >
                Deploy
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight */}
              <div>
                <label className="block text-sm font-medium mb-2">Weight (g)</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setProductForm(prev => ({ ...prev, weight: Math.max(1, prev.weight - 10) }))}
                    className="bg-gray-600 hover:bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center"
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={productForm.weight}
                    onChange={(e) => setProductForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <button 
                    onClick={() => setProductForm(prev => ({ ...prev, weight: prev.weight + 10 }))}
                    className="bg-gray-600 hover:bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Materials */}
              <div>
                <label className="block text-sm font-medium mb-2">Materials (e.g. cotton, bamboo)</label>
                <input 
                  type="text" 
                  value={productForm.materials}
                  onChange={(e) => setProductForm(prev => ({ ...prev, materials: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="handmade paper"
                />
              </div>
            </div>

            {/* Percent Recycled Material */}
            <div>
              <label className="block text-sm font-medium mb-2">Percent Recycled Material</label>
              <div className="relative">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={productForm.percentRecycled}
                  onChange={(e) => setProductForm(prev => ({ ...prev, percentRecycled: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #d67a4a 0%, #d67a4a ${productForm.percentRecycled}%, #374151 ${productForm.percentRecycled}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>0</span>
                  <span className="text-[#d67a4a] font-medium">{productForm.percentRecycled}</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Production Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Production Method</label>
                <select 
                  value={productForm.productionMethod}
                  onChange={(e) => setProductForm(prev => ({ ...prev, productionMethod: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="handmade">handmade</option>
                  <option value="small-batch">small-batch</option>
                  <option value="machine-made">machine-made</option>
                </select>
              </div>

              {/* Distance to Market */}
              <div>
                <label className="block text-sm font-medium mb-2">Distance to Market (km)</label>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setProductForm(prev => ({ ...prev, distanceToMarket: Math.max(1, prev.distanceToMarket - 10) }))}
                    className="bg-gray-600 hover:bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center"
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={productForm.distanceToMarket}
                    onChange={(e) => setProductForm(prev => ({ ...prev, distanceToMarket: parseInt(e.target.value) || 0 }))}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <button 
                    onClick={() => setProductForm(prev => ({ ...prev, distanceToMarket: prev.distanceToMarket + 10 }))}
                    className="bg-gray-600 hover:bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Packaging Weight */}
            <div>
              <label className="block text-sm font-medium mb-2">Packaging Weight (g)</label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setProductForm(prev => ({ ...prev, packagingWeight: Math.max(1, prev.packagingWeight - 5) }))}
                  className="bg-gray-600 hover:bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  −
                </button>
                <input 
                  type="number" 
                  value={productForm.packagingWeight}
                  onChange={(e) => setProductForm(prev => ({ ...prev, packagingWeight: parseInt(e.target.value) || 0 }))}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <button 
                  onClick={() => setProductForm(prev => ({ ...prev, packagingWeight: prev.packagingWeight + 5 }))}
                  className="bg-gray-600 hover:bg-gray-500 w-8 h-8 rounded-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!calculatedImpact ? (
                <button 
                  onClick={handleCalculateImpact}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition"
                >
                  Calculate Impact
                </button>
              ) : (
                <button 
                  onClick={handleSaveProduct}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition"
                  disabled={showSuccessMessage}
                >
                  {showSuccessMessage ? '✓ Product saved successfully!' : 'Save Product'}
                </button>
              )}
            </div>

            {/* Calculated Impact Display */}
            {calculatedImpact && (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-3">Calculated Environmental Impact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">{calculatedImpact.carbonSaved.toFixed(1)} kg</div>
                      <div className="text-green-300 text-sm">CO₂ Saved vs Factory Production</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{calculatedImpact.sustainabilityScore.toFixed(1)}%</div>
                      <div className="text-blue-300 text-sm">Sustainability Score</div>
                    </div>
                  </div>
                </div>
                
                {/* AI Recommendations Section */}
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-400">🤖 AI Sustainability Assistant</h4>
                    <button
                      onClick={() => setShowChatbot(true)}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Get AI Advice
                    </button>
                  </div>
                  <p className="text-blue-300 text-sm mb-3">
                    Get personalized recommendations to improve your sustainability score and reduce carbon footprint.
                  </p>
                  <div className="text-xs text-blue-400">
                    💡 Ask about: Material optimization • Packaging reduction • Carbon footprint improvements • Sustainable practices
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Impact Display */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{carbonData.totalCO2Saved.toFixed(1)} kg</div>
                <div className="text-green-300 font-medium">Total CO₂ Saved</div>
                <div className="text-xs text-green-400 mt-1">This year</div>
              </div>
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{carbonData.impactComparison.treesPlanted}</div>
                <div className="text-blue-300 font-medium">Trees Equivalent</div>
                <div className="text-xs text-blue-400 mt-1">CO₂ absorption</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">{carbonData.impactComparison.wasteReduced} kg</div>
                <div className="text-orange-300 font-medium">Waste Reduced</div>
                <div className="text-xs text-orange-400 mt-1">vs factory products</div>
              </div>
            </div>

            {/* Monthly Carbon Impact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Monthly Carbon Impact</h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-end h-32 mb-2">
                  {carbonData.monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-green-500 w-8 rounded-t transition-all hover:bg-green-400" 
                        style={{ height: `${(data.co2Saved / 4) * 100}%` }}
                        title={`${data.co2Saved} kg CO₂ saved`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  {carbonData.monthlyData.map((data, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div className="font-medium">{data.month}</div>
                      <div>{data.co2Saved} kg</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Your Environmental Impact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="flex items-center gap-2 font-medium mb-2">
                    <span className="text-2xl">🏭</span> Factory Products Avoided
                  </h5>
                  <p className="text-2xl font-bold text-red-400 mb-1">{carbonData.impactComparison.factoryProductsAvoided}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="flex items-center gap-2 font-medium mb-2">
                    <span className="text-2xl">♻️</span> Sustainable Choices
                  </h5>
                  <p className="text-2xl font-bold text-green-400 mb-1">100%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sustainability Chatbot */}
        {showChatbot && (
          <SustainabilityChatbot
            productData={{
              category: 'textiles',
              weight_g: productForm.weight,
              packaging_weight_g: productForm.packagingWeight,
              distance_km_to_market: productForm.distanceToMarket,
              percent_recycled_material: productForm.percentRecycled,
              production_method: productForm.productionMethod,
              materials: productForm.materials
            }}
            currentImpact={calculatedImpact ? {
              carbon_footprint: calculatedImpact.carbonSaved,
              sustainability_score: calculatedImpact.sustainabilityScore
            } : undefined}
            onClose={() => setShowChatbot(false)}
            onSuggestionApply={(suggestion) => {
              console.log('Applied suggestion:', suggestion);
              // You can implement suggestion application logic here
            }}
          />
        )}
      </div>
    </div>
  );
};

const ProfileModal: FC<{
  user?: User | null;
  setUser: (u: User) => void;
  onClose: () => void;
  onLogout: () => void;
}> = ({ user, setUser, onClose, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<User>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    profileImage: user?.profileImage || '',
    address: user?.address || ''
  });

  const handleSave = () => {
    try {
      localStorage.setItem('cc_user', JSON.stringify(form));
    } catch {}
    setUser(form);
    setEditing(false);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-60 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="modal-content bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{editing ? 'Edit Profile' : 'Your Profile'}</h3>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">👤</div>
              )}
              <div>
                <div className="font-semibold text-lg">{user?.name || 'Buyer'}</div>
                {user?.email && <div className="text-sm text-gray-600">{user.email}</div>}
                {user?.phone && <div className="text-sm text-gray-600">📱 {user.phone}</div>}
                {user?.address && <div className="text-sm text-gray-600">📍 {user.address}</div>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditing(true)} className="btn-primary flex-1">Edit Profile</button>
              <button onClick={onLogout} className="btn-secondary flex-1">Logout</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input className="input-field w-full" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input-field w-full" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input-field w-full" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input-field w-full" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input className="input-field w-full" placeholder="Profile Image URL" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="btn-primary flex-1">Save</button>
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BuyerDashboard: FC<BuyerDashboardProps> = ({ user: initialUser, onNavigate, onLogout }) => {
  const [user, setUser] = useState<User | null>(initialUser || (() => {
    try {
      const raw = localStorage.getItem('cc_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return initialUser || null;
    }
  })());
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showCarbonFootprint, setShowCarbonFootprint] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // initialize cart from localStorage only once (lazy initializer)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('cc_cart');
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // Mock data
  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'terracotta', name: 'Terracotta', icon: '🏺' },
    { id: 'jute', name: 'Jute & Bags', icon: '👜' },
    { id: 'textiles', name: 'Textiles', icon: '🧵' },
    { id: 'bamboo', name: 'Bamboo & Wood', icon: '🎋' }
  ];

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Handcrafted Terracotta Vase',
      description: 'Beautiful handmade terracotta vase with intricate designs',
      price: 899,
      co2Saved: 2.5,
      category: 'terracotta',
      image: 'https://images.pexels.com/photos/6474306/pexels-photo-6474306.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      name: 'Organic Jute Shopping Bag',
      description: 'Eco-friendly jute bag perfect for daily shopping',
      price: 299,
      co2Saved: 1.2,
      category: 'jute',
      image: 'https://images.pexels.com/photos/7262772/pexels-photo-7262772.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Handwoven Cotton Throw',
      description: 'Soft handwoven cotton throw with traditional patterns',
      price: 1299,
      co2Saved: 3.8,
      category: 'textiles',
      image: 'https://images.pexels.com/photos/6969998/pexels-photo-6969998.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      name: 'Bamboo Kitchen Set',
      description: 'Complete bamboo kitchen utensils set',
      price: 699,
      co2Saved: 2.1,
      category: 'bamboo',
      image: 'https://images.pexels.com/photos/6633920/pexels-photo-6633920.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      name: 'Traditional Clay Water Pot',
      description: 'Naturally cooling clay water pot with lid',
      price: 450,
      co2Saved: 1.8,
      category: 'terracotta',
      image: 'https://images.pexels.com/photos/5738076/pexels-photo-5738076.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 6,
      name: 'Handmade Jute Coasters',
      description: 'Set of 6 decorative jute coasters',
      price: 199,
      co2Saved: 0.8,
      category: 'jute',
      image: 'https://images.pexels.com/photos/6195124/pexels-photo-6195124.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const persistCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('cc_cart', JSON.stringify(newCart));
    } catch {
      // ignore localStorage errors (e.g. in private mode)
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    persistCart(newCart);

    // Show toast
    showToast(`${product.name} added to cart!`);
    setShowProductModal(false);
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) document.body.removeChild(toast);
    }, 3000);
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#154731]">CraftConnect</h1>

              {/* Search Bar */}
              <div className="hidden md:block flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 text-[#333] hover:text-[#154731] relative"
              >
                <span className="text-xl">👤</span>
                <span className="hidden sm:inline font-medium">Profile</span>
              </button>

              <button
                onClick={() => onNavigate('buyer-cart')}
                className="flex items-center space-x-2 text-[#333] hover:text-[#154731] relative"
              >
                <span className="text-xl">🛒</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#d67a4a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
                <span className="hidden sm:inline font-medium">Cart</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="profile-card sticky top-24">
              <div className="text-center mb-4">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👤</span>
                  </div>
                )}
                <h3 className="font-semibold text-lg">Welcome, {user?.name || 'Buyer'}!</h3>
                <p className="text-white/80 text-sm">Role: Buyer</p>
                <p className="text-white/80 text-sm">📱 {user?.phone}</p>
                {user?.address && <p className="text-white/80 text-sm">📍 {user.address}</p>}
              </div>

            <div className="space-y-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
                >
                  🏠 Back to Home
                </button>
                <button
                  onClick={() => setShowProfile(true)}
                  className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
                >
                  👤 View Profile
                </button>
                <button
                  onClick={() => setShowCarbonFootprint(true)}
                  className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
                >
                  🌱 Carbon Footprint
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="summary-card">
                <div className="text-3xl font-bold mb-2">12.5 kg</div>
                <div className="text-white/90">Total CO₂ Saved</div>
                <div className="text-xs text-white/70 mt-1">🌱 Equivalent to planting 2 trees</div>
              </div>

              <div className="summary-card secondary">
                <div className="text-3xl font-bold mb-2">8</div>
                <div className="text-white/90">Orders Placed</div>
                <div className="text-xs text-white/70 mt-1">📦 All delivered successfully</div>
              </div>

              <div className="summary-card tertiary">
                <div className="text-3xl font-bold mb-2">₹2,340</div>
                <div className="text-white/90">Amount Saved</div>
                <div className="text-xs text-white/70 mt-1">💰 vs. mass market products</div>
              </div>
            </div>

            {/* Categories */}
            <div className="dashboard-card">
              <h3 className="text-lg font-semibold text-[#333] mb-4">Shop by Category</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-6">
                {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
                <span className="text-sm font-normal text-[#666] ml-2">({filteredProducts.length} items)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="product-card cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductModal(true);
                    }}
                  >
                    <div className="h-48 bg-gray-200 rounded-t-[14px] overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-[#333] mb-2 line-clamp-2">
                        {product.name}
                      </h4>

                      <p className="text-sm text-[#666] mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-[#154731]">
                          ₹{product.price}
                        </span>
                        <CarbonFootprintBadge 
                          co2Savings={product.co2SavingKg || product.co2Saved}
                          sustainabilityScore={product.sustainabilityScore}
                          size="small"
                          showDetails={false}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/40" onClick={() => setShowProductModal(false)}>
          <div className="modal-content bg-white rounded-lg max-w-3xl w-full p-6 mx-auto mt-20" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#333]">Product Details</h3>
              <button onClick={() => setShowProductModal(false)} className="text-[#666] hover:text-[#333] text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-lg" />

              <h4 className="text-lg font-semibold">{selectedProduct.name}</h4>
              <p className="text-[#666]">{selectedProduct.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-[#154731]">₹{selectedProduct.price}</span>
              </div>
              
              <CarbonFootprintCard 
                co2Savings={selectedProduct.co2SavingKg || selectedProduct.co2Saved}
                sustainabilityScore={selectedProduct.sustainabilityScore}
                wasteReduction={selectedProduct.wasteReductionPct}
                compactMode={false}
              />

              <div className="flex gap-3 pt-4">
                <button onClick={() => addToCart(selectedProduct)} className="btn-primary flex-1">🛒 Add to Cart</button>
                <button onClick={() => { addToCart(selectedProduct); onNavigate('buyer-cart'); }} className="btn-secondary flex-1">💳 Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && user && <ProfileModal user={user} setUser={setUser} onClose={() => setShowProfile(false)} onLogout={onLogout} />}
      
      {/* Carbon Footprint Modal */}
      {showCarbonFootprint && <CarbonFootprintModal user={user} onClose={() => setShowCarbonFootprint(false)} />}
    </div>
  );
};

export default BuyerDashboard;
