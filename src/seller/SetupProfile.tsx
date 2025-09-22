import React, { useState } from 'react';

const SellerSetupProfile = ({ onNavigate, onBack, tempData, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
        setFormData(prev => ({ ...prev, profileImage: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create complete user data
    const userData = {
      ...tempData,
      ...formData,
      isComplete: true,
      type: 'seller',
      id: Date.now().toString()
    };

    // Save to localStorage
    localStorage.setItem('cc_seller', JSON.stringify(userData));
    
    // Update current user
    onUpdateUser(userData);
    
    // Navigate to dashboard
    onNavigate('seller-dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="dashboard-card">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#d67a4a] mb-2">
              Complete Your Seller Profile
            </h2>
            <p className="text-[#666]">
              Set up your artisan profile to start selling
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#d67a4a]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <span className="text-4xl">🎨</span>
                  </div>
                )}
              </div>
              <label className="btn-secondary cursor-pointer">
                Upload Photo (Max 2MB)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your craft business name"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#333] mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field h-20 resize-none"
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your state"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#333] mb-2">
                  PIN Code
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter PIN code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Complete Setup & Start Selling
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-[#666] hover:text-[#333] font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSetupProfile;