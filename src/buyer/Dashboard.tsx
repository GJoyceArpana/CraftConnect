import React, { useState } from 'react';

const BuyerDashboard = ({ user, onNavigate, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cc_cart') || '[]'));

  // Mock data
  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'terracotta', name: 'Terracotta', icon: '🏺' },
    { id: 'jute', name: 'Jute & Bags', icon: '👜' },
    { id: 'textiles', name: 'Textiles', icon: '🧵' },
    { id: 'bamboo', name: 'Bamboo & Wood', icon: '🎋' }
  ];

  const mockProducts = [
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

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cc_cart', JSON.stringify(newCart));
    
    // Show toast
    showToast(`${product.name} added to cart!`);
    setShowProductModal(false);
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
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
                onClick={() => setShowProfile(!showProfile)}
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
                <span className="text-sm font-normal text-[#666] ml-2">
                  ({filteredProducts.length} items)
                </span>
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
                        <span className="text-lg font-bold text-[#154731]">
                          ₹{product.price}
                        </span>
                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          🌱 -{product.co2Saved}kg CO₂
                        </div>
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
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#333]">Product Details</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-[#666] hover:text-[#333] text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <h4 className="text-lg font-semibold">{selectedProduct.name}</h4>
                <p className="text-[#666]">{selectedProduct.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#154731]">
                    ₹{selectedProduct.price}
                  </span>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    🌱 Saves {selectedProduct.co2Saved}kg CO₂
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    className="btn-primary flex-1"
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      onNavigate('buyer-cart');
                    }}
                    className="btn-secondary flex-1"
                  >
                    💳 Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;