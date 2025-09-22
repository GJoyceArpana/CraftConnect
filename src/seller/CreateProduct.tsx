import React, { useState } from 'react';

const CreateProduct = ({ user, onNavigate, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    material: '',
    weight: '',
    process: '',
    productImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [co2Prediction, setCo2Prediction] = useState(0);

  const categories = [
    { id: 'terracotta', name: 'Terracotta' },
    { id: 'jute', name: 'Jute & Bags' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'bamboo', name: 'Bamboo & Wood' }
  ];

  // Mock CO2 calculation function
  const calculateCO2Impact = (material, weight, process) => {
    const baseCO2 = parseFloat(weight) || 1;
    const materialMultiplier = {
      'clay': 0.8,
      'jute': 1.2,
      'cotton': 0.9,
      'bamboo': 1.5,
      'wood': 1.3
    };
    const processMultiplier = {
      'handmade': 2.0,
      'traditional': 1.8,
      'sustainable': 2.2
    };
    
    const materialFactor = materialMultiplier[material.toLowerCase()] || 1.0;
    const processFactor = processMultiplier[process.toLowerCase()] || 1.0;
    
    return (baseCO2 * materialFactor * processFactor).toFixed(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update CO2 prediction when relevant fields change
    if (name === 'material' || name === 'weight' || name === 'process') {
      const updatedData = { ...formData, [name]: value };
      const prediction = calculateCO2Impact(updatedData.material, updatedData.weight, updatedData.process);
      setCo2Prediction(prediction);
    }
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
        setFormData(prev => ({ ...prev, productImage: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create product data
    const productData = {
      ...formData,
      id: Date.now().toString(),
      sellerId: user.id,
      sellerName: user.name,
      co2Prediction: parseFloat(co2Prediction),
      createdAt: new Date().toISOString(),
      image: formData.productImage || 'https://images.pexels.com/photos/6474306/pexels-photo-6474306.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    // Save to localStorage
    const existingProducts = JSON.parse(localStorage.getItem('cc_seller_products') || '[]');
    localStorage.setItem('cc_seller_products', JSON.stringify([...existingProducts, productData]));

    alert('Product created successfully! 🎉');
    onNavigate('seller-dashboard');
  };

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
              <h1 className="text-2xl font-bold text-[#d67a4a]">Create New Product</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="dashboard-card">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Image */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#333] mb-4">Product Image</h3>
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Product" 
                      className="w-48 h-48 rounded-lg object-cover border-4 border-[#d67a4a]"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-lg bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                      <span className="text-6xl">📷</span>
                    </div>
                  )}
                </div>
                <label className="btn-secondary cursor-pointer">
                  Upload Product Image (Max 2MB)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field h-24 resize-none"
                    placeholder="Describe your product's features, craftsmanship, and uniqueness"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter price"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sustainability Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-4">
                Sustainability Details
                <span className="text-sm font-normal text-[#666] ml-2">(for CO₂ calculation)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Material *
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Clay, Jute, Cotton"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Product weight"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">
                    Process *
                  </label>
                  <input
                    type="text"
                    name="process"
                    value={formData.process}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., Handmade, Traditional"
                    required
                  />
                </div>
              </div>

              {/* CO2 Prediction Display */}
              {co2Prediction > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">
                        🌱 Environmental Impact Prediction
                      </h4>
                      <p className="text-sm text-green-600">
                        This product will help buyers save approximately <strong>{co2Prediction}kg of CO₂</strong> compared to mass-produced alternatives.
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      {co2Prediction}kg
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBack}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;