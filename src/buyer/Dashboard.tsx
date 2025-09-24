// src/BuyerDashboard.tsx
import { useState } from 'react';
import type { FC } from 'react';

// -------- Image imports (using existing images in src/assets/images) --------
// Make sure this path is correct for your project layout. If this file is in src/buyer,
// change to: import img2 from '../../assets/images/img2.jpg'; etc.
import img2 from '../assets/images/img2.jpg'; // Handwoven Cotton Shawl (textiles)
import img3 from '../assets/images/img3.jpg'; // Bamboo Basket (bamboo)
import img4 from '../assets/images/img4.jpg'; // Jute Bags (jute)
import img5 from '../assets/images/img5.jpg'; // Terracotta Pots (terracotta)

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  co2Saved: number;
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
  address?: string;
};

type BuyerDashboardProps = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
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

  // Mock categories
  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'terracotta', name: 'Terracotta', icon: '🏺' },
    { id: 'jute', name: 'Jute & Bags', icon: '👜' },
    { id: 'textiles', name: 'Textiles', icon: '🧵' },
    { id: 'bamboo', name: 'Bamboo & Wood', icon: '🎋' }
  ];

  // ---------- Use only the four provided images/products ----------
  const mockProducts: Product[] = [
    {
      id: 2,
      name: 'Handwoven Cotton Shawl',
      description: 'Soft handwoven cotton shawl with traditional patterns',
      price: 1299,
      co2Saved: 3.8,
      category: 'textiles',
      image: img2
    },
    {
      id: 3,
      name: 'Bamboo Storage Basket',
      description: 'Handmade bamboo basket — lightweight and durable.',
      price: 699,
      co2Saved: 2.1,
      category: 'bamboo',
      image: img3
    },
    {
      id: 4,
      name: 'Jute Shopping Bag',
      description: 'Eco-friendly jute bag perfect for daily shopping',
      price: 299,
      co2Saved: 1.2,
      category: 'jute',
      image: img4
    },
    {
      id: 5,
      name: 'Terracotta Serving Pots',
      description: 'Set of handcrafted terracotta pots with earthy finish.',
      price: 899,
      co2Saved: 2.5,
      category: 'terracotta',
      image: img5
    }
  ];
  // ----------------------------------------------------------------

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

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#154731]">₹{selectedProduct.price}</span>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">🌱 Saves {selectedProduct.co2Saved}kg CO₂</div>
              </div>

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
    </div>
  );
};

export default BuyerDashboard;
