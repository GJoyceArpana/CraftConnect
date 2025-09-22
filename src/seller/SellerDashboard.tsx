import React, { useState, useEffect } from 'react';

const SellerDashboard = ({ user, onNavigate, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load seller's products
    const sellerProducts = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
    setProducts(sellerProducts.filter(product => product.sellerId === user?.id));
  }, [user]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteProduct = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const allProducts = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
      const updatedProducts = allProducts.filter(p => p.id !== productId);
      localStorage.setItem('cc_seller_products', JSON.stringify(updatedProducts));
      setProducts(products.filter(p => p.id !== productId));
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
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your products..."
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-[#333] hover:text-[#d67a4a]">
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
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎨</span>
                  </div>
                )}
                <h3 className="font-semibold text-lg">Welcome, {user?.name || 'Seller'}!</h3>
                <p className="text-white/80 text-sm">Role: Artisan</p>
                <p className="text-white/80 text-sm">📱 {user?.phone}</p>
                {user?.businessName && (
                  <p className="text-white/80 text-sm">🏪 {user.businessName}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="w-full text-left text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition"
                >
                  🏠 Back to Home
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
                <button
                  onClick={() => onNavigate('seller-create')}
                  className="btn-primary"
                >
                  ➕ Create New Product
                </button>
              </div>
              
              <p className="text-[#666] text-sm">
                Share your beautiful handcrafted products with conscious buyers. 
                Each product helps promote sustainability and traditional crafts.
              </p>
            </div>

            {/* Products List */}
            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-6">
                Your Products ({filteredProducts.length})
              </h3>
              
              {filteredProducts.length === 0 ? (
                <div className="dashboard-card text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <h4 className="text-xl font-semibold text-[#333] mb-2">No products yet</h4>
                  <p className="text-[#666] mb-6">Start by creating your first product to begin selling</p>
                  <button
                    onClick={() => onNavigate('seller-create')}
                    className="btn-primary"
                  >
                    Create Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="h-48 bg-gray-200 rounded-t-[14px] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-4">
                        <h4 className="font-semibold text-[#333] mb-2 line-clamp-2">
                          {product.name}
                        </h4>
                        
                        <p className="text-sm text-[#666] mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-[#d67a4a]">
                            ₹{product.price}
                          </span>
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            🌱 -{product.co2Prediction}kg CO₂
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition"
                          >
                            Delete
                          </button>
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
    </div>
  );
};

export default SellerDashboard;