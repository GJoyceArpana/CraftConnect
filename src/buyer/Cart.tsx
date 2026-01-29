// src/BuyerCart.tsx
import { useState } from 'react';
import type { FC } from 'react';

type User = {
  id?: string | number;
  name?: string;
  phone?: string;
  profileImage?: string;
  email?: string;
  address?: string;
};

type CartItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  co2Saved: number;
  image?: string;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
};

type BuyerCartProps = {
  user?: User | null;
  onNavigate: (path: string) => void;
  onBack: () => void;
};

const BuyerCart: FC<BuyerCartProps> = ({ user: _user, onNavigate, onBack }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('cc_cart');
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const updateQuantity = (productId: number, newQuantity: number): void => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    try {
      localStorage.setItem('cc_cart', JSON.stringify(updatedCart));
    } catch {}
  };

  const removeFromCart = (productId: number): void => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    try {
      localStorage.setItem('cc_cart', JSON.stringify(updatedCart));
    } catch {}
  };

  const subtotal: number = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalCO2Saved: number = cart.reduce((total, item) => total + (item.co2Saved * item.quantity), 0);

  const handleCheckout = (): void => {
    const orderItems = cart.map(item => ({
      ...item,
      sellerId: item.sellerId ?? 'local-seller',
      sellerName: item.sellerName ?? 'Local Seller'
    }));
    // Create order
    const order = {
      id: Date.now().toString(),
      items: orderItems,
      subtotal,
      totalCO2Saved,
      date: new Date().toISOString(),
      status: 'confirmed'
    };

    // Save order
    try {
      const existingOrders = JSON.parse(localStorage.getItem('cc_orders') || '[]');
      localStorage.setItem('cc_orders', JSON.stringify([...existingOrders, order]));
    } catch {
      localStorage.setItem('cc_orders', JSON.stringify([order]));
    }
    window.dispatchEvent(new Event('cc-orders-updated'));

    // Clear cart
    setCart([]);
    try {
      localStorage.removeItem('cc_cart');
    } catch {}

    alert('Order placed successfully! 🎉');
    onNavigate('buyer-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-[#666] hover:text-[#333] font-medium"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-[#154731]">Shopping Cart</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="dashboard-card text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-[#333] mb-2">Your cart is empty</h3>
            <p className="text-[#666] mb-6">Add some sustainable products to get started!</p>
            <button
              onClick={() => onNavigate('buyer-dashboard')}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-[#333] mb-4">
                Cart Items ({cart.length})
              </h3>

              {cart.map(item => (
                <div key={item.id} className="dashboard-card">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-[#333]">{item.name}</h4>
                      <p className="text-sm text-[#666] mb-2">{item.description}</p>
                      <div className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full inline-block">
                        🌱 -{item.co2Saved}kg CO₂ each
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-lg font-bold text-[#154731] mb-2">
                        ₹{item.price}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="dashboard-card sticky top-24">
                <h3 className="text-lg font-semibold text-[#333] mb-4">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#666]">Items ({cart.length})</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#666]">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-[#154731]">₹{subtotal}</span>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🌱</div>
                    <div className="text-lg font-bold text-green-700 mb-1">
                      {totalCO2Saved.toFixed(1)}kg CO₂ Saved
                    </div>
                    <div className="text-xs text-green-600">
                      Equivalent to planting {Math.ceil(totalCO2Saved / 6)} trees
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="btn-primary w-full text-lg"
                >
                  Checkout - ₹{subtotal}
                </button>

                <p className="text-xs text-[#666] text-center mt-3">
                  Demo checkout - no payment required
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerCart;
