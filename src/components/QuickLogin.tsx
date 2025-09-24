import React from 'react';

interface QuickLoginProps {
  onNavigate: (route: string, data?: any) => void;
}

export const QuickLogin: React.FC<QuickLoginProps> = ({ onNavigate }) => {
  
  const loginAsBuyer = () => {
    // Create test buyer data
    const testBuyer = {
      phone: '1234567890',
      password: 'test123',
      name: 'Test Buyer',
      email: 'buyer@test.com',
      address: 'Test Address, Test City',
      isComplete: true,
      type: 'buyer',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Store in localStorage
    localStorage.setItem('cc_buyer', JSON.stringify(testBuyer));
    
    // Navigate to buyer dashboard
    onNavigate('buyer-dashboard', testBuyer);
  };
  
  const loginAsSeller = () => {
    // Create test seller data
    const testSeller = {
      phone: '0987654321',
      password: 'test123',
      businessName: 'Test Craft Business',
      ownerName: 'Test Seller',
      email: 'seller@test.com',
      address: 'Test Business Address',
      category: 'textiles',
      description: 'Test business description',
      isComplete: true,
      type: 'seller',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    // Store in localStorage
    localStorage.setItem('cc_seller', JSON.stringify(testSeller));
    
    // Navigate to seller dashboard
    onNavigate('seller-dashboard', testSeller);
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">🚀 Quick Test Login</h2>
      
      <p className="text-gray-600 text-sm mb-6 text-center">
        Skip the signup process and instantly access profiles for testing.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={loginAsBuyer}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          🛒 Login as Test Buyer
        </button>
        
        <button
          onClick={loginAsSeller}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          🎨 Login as Test Seller
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">What this does:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Creates temporary test user profiles</li>
          <li>• Stores them in browser localStorage</li>
          <li>• Takes you directly to the dashboard</li>
          <li>• Bypasses Firebase authentication for testing</li>
        </ul>
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => onNavigate('home')}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};
