// src/SellerDashboard.tsx
import React, { useState, useEffect } from 'react';

type User = {
  id?: string | number;
  name?: string;
  phone?: string;
  profileImage?: string;
  businessName?: string;
  email?: string;
  address?: string; // <-- added address
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  sellerId?: string | number;
  co2Prediction?: number;
};

type SellerDashboardProps = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

const CarbonFootprintModal: React.FC<{
  user?: User | null;
  products: Product[];
  onClose: () => void;
}> = ({ user, products, onClose }) => {
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

  // Load carbon footprint data from localStorage
  const getUserCarbonData = () => {
    try {
      const userImpact = JSON.parse(localStorage.getItem(`cc_user_impact_${user?.id}`) || '{}');
      const carbonHistory = JSON.parse(localStorage.getItem('cc_carbon_history') || '[]')
        .filter((item: any) => item.sellerId === user?.id);
      
      const totalCO2Saved = userImpact.totalCO2Saved || carbonHistory.reduce((sum: number, item: any) => sum + (item.carbonSaved || 0), 0) || 12.5;
      const treesEquivalent = Math.round(totalCO2Saved / 6.25); // 1 tree absorbs ~6.25kg CO2/year
      const wasteReduced = totalCO2Saved * 1.2; // Estimate waste reduction
      
      return {
        totalCO2SavedByProducts: products.reduce((sum, p) => sum + (p.co2Prediction || 0), 0),
        customersSaved: carbonHistory.length * 5 || 45, // Estimate customers helped
        monthlyData: [
          { month: 'Jan', co2Saved: 2.1, productsSold: 8 },
          { month: 'Feb', co2Saved: 1.8, productsSold: 6 },
          { month: 'Mar', co2Saved: 3.2, productsSold: 11 },
          { month: 'Apr', co2Saved: 2.7, productsSold: 9 },
          { month: 'May', co2Saved: 2.7, productsSold: 13 }
        ],
        impactComparison: {
          treesEquivalent: Math.max(treesEquivalent, 2),
          factoryProductsReplaced: carbonHistory.length * 3 || 8,
          wastePreventedKg: Math.round(wasteReduced * 10) / 10 || 15.2
        }
      };
    } catch (error) {
      // Fallback to mock data if localStorage fails
      return {
        totalCO2SavedByProducts: products.reduce((sum, p) => sum + (p.co2Prediction || 0), 0),
        customersSaved: 45,
        monthlyData: [
          { month: 'Jan', co2Saved: 2.1, productsSold: 8 },
          { month: 'Feb', co2Saved: 1.8, productsSold: 6 },
          { month: 'Mar', co2Saved: 3.2, productsSold: 11 },
          { month: 'Apr', co2Saved: 2.7, productsSold: 9 },
          { month: 'May', co2Saved: 2.7, productsSold: 13 }
        ],
        impactComparison: {
          treesEquivalent: 2,
          factoryProductsReplaced: 8,
          wastePreventedKg: 15.2
        }
      };
    }
  };

  const carbonData = getUserCarbonData();

  const totalCO2Saved = carbonData.monthlyData.reduce((sum, month) => sum + month.co2Saved, 0);

  const handleCalculateImpact = async () => {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight_g: productForm.weight,
          materials: productForm.materials,
          percent_recycled_material: productForm.percentRecycled,
          production_method: productForm.productionMethod,
          distance_km_to_market: productForm.distanceToMarket,
          packaging_weight_g: productForm.packagingWeight,
          category: 'textiles' // Default category
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalculatedImpact({
          carbonSaved: data.carbon_footprint,
          sustainabilityScore: data.sustainability_score
        });
      }
    } catch (error) {
      console.error('Error calculating impact:', error);
      // Fallback calculation
      setCalculatedImpact({
        carbonSaved: (productForm.weight / 1000) * 2.5,
        sustainabilityScore: productForm.percentRecycled * 0.8
      });
    }
  };

  const handleSaveProduct = () => {
    if (calculatedImpact && user?.id) {
      try {
        // Save product to user's carbon footprint data
        const newProductData = {
          id: Date.now(),
          name: `Eco Product - ${productForm.materials}`,
          weight: productForm.weight,
          materials: productForm.materials,
          percentRecycled: productForm.percentRecycled,
          productionMethod: productForm.productionMethod,
          distanceToMarket: productForm.distanceToMarket,
          packagingWeight: productForm.packagingWeight,
          carbonSaved: calculatedImpact.carbonSaved,
          sustainabilityScore: calculatedImpact.sustainabilityScore,
          createdAt: new Date().toISOString(),
          sellerId: user.id
        };

        // Update user's carbon footprint history
        const existingHistory = JSON.parse(localStorage.getItem('cc_carbon_history') || '[]');
        existingHistory.push(newProductData);
        localStorage.setItem('cc_carbon_history', JSON.stringify(existingHistory));

        // Update user's total environmental impact
        const userImpact = JSON.parse(localStorage.getItem(`cc_user_impact_${user.id}`) || '{}');
        userImpact.totalCO2Saved = (userImpact.totalCO2Saved || 0) + calculatedImpact.carbonSaved;
        userImpact.totalProducts = (userImpact.totalProducts || 0) + 1;
        userImpact.lastUpdated = new Date().toISOString();
        localStorage.setItem(`cc_user_impact_${user.id}`, JSON.stringify(userImpact));

        console.log('Saving product with impact:', newProductData);
        
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setCurrentView('impact');
          // Reset form for next product
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
          /* Product Input Form */
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
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
            )}
          </div>
        ) : (
          /* Impact Display */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{totalCO2Saved.toFixed(1)} kg</div>
                <div className="text-green-300 font-medium">Total CO₂ Saved</div>
                <div className="text-xs text-green-400 mt-1">This year</div>
              </div>
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{carbonData.impactComparison.treesEquivalent}</div>
                <div className="text-blue-300 font-medium">Trees Equivalent</div>
                <div className="text-xs text-blue-400 mt-1">CO₂ absorption</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">{carbonData.impactComparison.wastePreventedKg} kg</div>
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
                  <p className="text-2xl font-bold text-red-400 mb-1">{carbonData.impactComparison.factoryProductsReplaced}</p>
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
      </div>
    </div>
  );
};

const ProfileModal: React.FC<{
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
    businessName: user?.businessName || '',
    profileImage: user?.profileImage || '',
    address: user?.address || ''
  });

  const handleSave = () => {
    try {
      localStorage.setItem('cc_seller', JSON.stringify(form));
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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">🎨</div>
              )}
              <div>
                <div className="font-semibold text-lg">{user?.name || 'Seller'}</div>
                {user?.businessName && <div className="text-sm text-gray-600">🏪 {user.businessName}</div>}
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
            <input className="input-field w-full" placeholder="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
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

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user: initialUser, onNavigate, onLogout }) => {
  const [user, setUser] = useState<User | null>(initialUser || (() => {
    try {
      const raw = localStorage.getItem('cc_seller');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return initialUser || null;
    }
  })());
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showCarbonFootprint, setShowCarbonFootprint] = useState(false);

  useEffect(() => {
    try {
      const sellerProducts: Product[] = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
      if (user?.id !== undefined) {
        setProducts(sellerProducts.filter(product => product.sellerId === user.id));
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    }
  }, [user]);

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const deleteProduct = (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const allProducts: Product[] = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
        const updatedProducts = allProducts.filter(p => p.id !== productId);
        localStorage.setItem('cc_seller_products', JSON.stringify(updatedProducts));
        setProducts(products.filter(p => p.id !== productId));
      } catch {}
    }
  };

  // Mock statistics
  const totalProducts = products.length;
  const totalSold = 25; // Mock data
  const totalRevenue = 8450; // Mock data

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#d67a4a]">CraftConnect Seller</h1>

              {/* Search Bar */}
              <div className="hidden md:block flex-1 max-w-md">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search your products..." className="input-field" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => setShowProfile(true)} className="flex items-center space-x-2 text-[#333] hover:text-[#d67a4a]">
                <span className="text-xl">👤</span>
                <span className="hidden sm:inline font-medium">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="profile-card sticky top-24 bg-gradient-to-br from-[#d67a4a] to-[#e08b5a]">
              <div className="text-center mb-4">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎨</span>
                  </div>
                )}
                <h3 className="font-semibold text-lg">Welcome, {user?.name || 'Seller'}!</h3>
                <p className="text-white/80 text-sm">Role: Artisan</p>
                <p className="text-white/80 text-sm">📱 {user?.phone}</p>
                {user?.businessName && <p className="text-white/80 text-sm">🏪 {user.businessName}</p>}
                {user?.address && <p className="text-white/80 text-sm">📍 {user.address}</p>}
              </div>

              <div className="space-y-3">
                <button onClick={() => onNavigate('home')} className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition">🏠 Back to Home</button>
                <button onClick={() => setShowProfile(true)} className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition">👤 View Profile</button>
                <button onClick={() => setShowCarbonFootprint(true)} className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition">🌱 Carbon Footprint</button>
                <button onClick={onLogout} className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition">🚪 Logout</button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="summary-card secondary">
                <div className="text-3xl font-bold mb-2">{totalProducts}</div>
                <div className="text-white/90">Products Listed</div>
                <div className="text-xs text-white/70 mt-1">🎨 Your craft collection</div>
              </div>

              <div className="summary-card">
                <div className="text-3xl font-bold mb-2">{totalSold}</div>
                <div className="text-white/90">Total Sold</div>
                <div className="text-xs text-white/70 mt-1">📦 Happy customers</div>
              </div>

              <div className="summary-card tertiary">
                <div className="text-3xl font-bold mb-2">₹{totalRevenue}</div>
                <div className="text-white/90">Revenue Earned</div>
                <div className="text-xs text-white/70 mt-1">💰 This month</div>
              </div>
            </div>

            {/* Create Product Button */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#333]">Product Management</h3>
                <button onClick={() => onNavigate('seller-create')} className="btn-primary">➕ Create New Product</button>
              </div>

              <p className="text-[#666] text-sm">Share your beautiful handcrafted products with conscious buyers. Each product helps promote sustainability and traditional crafts.</p>
            </div>

            {/* Products List */}
            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-6">Your Products ({filteredProducts.length})</h3>

              {filteredProducts.length === 0 ? (
                <div className="dashboard-card text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h4 className="text-xl font-semibold text-[#333] mb-2">No products yet</h4>
                  <p className="text-[#666] mb-6">Start by creating your first product to begin selling</p>
                  <button onClick={() => onNavigate('seller-create')} className="btn-primary">Create Your First Product</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="h-48 bg-gray-200 rounded-t-[14px] overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-[#333] mb-2 line-clamp-2">{product.name}</h4>
                        <p className="text-sm text-[#666] mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-[#d67a4a]">₹{product.price}</span>
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">🌱 -{product.co2Prediction ?? 0}kg CO₂</div>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => deleteProduct(product.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && user && <ProfileModal user={user} setUser={setUser} onClose={() => setShowProfile(false)} onLogout={onLogout} />}
      
      {/* Carbon Footprint Modal */}
      {showCarbonFootprint && <CarbonFootprintModal user={user} products={products} onClose={() => setShowCarbonFootprint(false)} />}
    </div>
  );
};

export default SellerDashboard;
