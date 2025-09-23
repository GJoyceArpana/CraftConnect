// src/CreateProduct.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';

type User = {
  id?: string | number;
  name?: string;
  [k: string]: any;
};

type CreateProductProps = {
  user?: User | null;
  onNavigate: (path: string, payload?: any) => void;
  onBack: () => void;
};

type FormState = {
  name: string;
  description: string;
  price: string; // keep as string for controlled input, convert on submit
  category: string;
  material: string;
  weight: string; // kg as string from input
  process: string;
  productImage?: string | null;
  // Additional fields for carbon footprint API
  packagingWeight: string;
  distanceToMarket: string;
  recycledMaterial: string;
};

type CarbonFootprintResponse = {
  carbon_footprint: number;
  sustainability_score: number;
  co2_saving_kg: number;
  waste_reduction_pct: number;
};

const categories = [
  { id: 'terracotta', name: 'Terracotta' },
  { id: 'textiles', name: 'Textiles' },
  { id: 'bamboo', name: 'Bamboo & Wood' },
  { id: 'toys', name: 'Toys & Crafts' },
  { id: 'painting', name: 'Painting & Arts' }
];

/**
 * Calculate CO2 impact and return a number (kg) with 1 decimal precision.
 * Returns a Number (not string) to avoid type mismatches.
 */
const calculateCO2Impact = (material: string, weightStr: string, process: string): number => {
  const baseCO2 = parseFloat(weightStr) || 1;
  const materialMultiplier: Record<string, number> = {
    clay: 0.8,
    jute: 1.2,
    cotton: 0.9,
    bamboo: 1.5,
    wood: 1.3
  };
  const processMultiplier: Record<string, number> = {
    handmade: 2.0,
    traditional: 1.8,
    sustainable: 2.2
  };

  const materialKey = (material || '').toLowerCase();
  const processKey = (process || '').toLowerCase();

  const materialFactor = materialMultiplier[materialKey] ?? 1.0;
  const processFactor = processMultiplier[processKey] ?? 1.0;

  const raw = baseCO2 * materialFactor * processFactor;
  // round to 1 decimal and return number
  return Math.round(raw * 10) / 10;
};

const CreateProduct: React.FC<CreateProductProps> = ({ user, onNavigate, onBack }) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    price: '',
    category: '',
    material: '',
    weight: '',
    process: '',
    productImage: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [co2Prediction, setCo2Prediction] = useState<number>(0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // update form data first
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // calculate CO2 prediction when relevant fields change
      if (name === 'material' || name === 'weight' || name === 'process') {
        const material = name === 'material' ? value : updated.material;
        const weight = name === 'weight' ? value : updated.weight;
        const process = name === 'process' ? value : updated.process;

        const prediction = calculateCO2Impact(material, weight, process);
        // set numeric prediction
        setCo2Prediction(prediction);
      }

      return updated;
    });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) {
        setImagePreview(result);
        setFormData(prev => ({ ...prev, productImage: result }));
      }
    };
    reader.onerror = () => {
      alert('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // basic validation
    if (!formData.name.trim()) {
      alert('Please enter product name');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter description');
      return;
    }
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid price');
      return;
    }
    const weightNum = parseFloat(formData.weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    // Build product object
    const productData = {
      ...formData,
      id: Date.now().toString(),
      sellerId: user?.id ?? null,
      sellerName: user?.name ?? 'Unknown Seller',
      price: priceNum,
      co2Prediction: co2Prediction || calculateCO2Impact(formData.material, formData.weight, formData.process),
      createdAt: new Date().toISOString(),
      image: formData.productImage ?? 'https://images.pexels.com/photos/6474306/pexels-photo-6474306.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    // Save to localStorage (defensive)
    try {
      const raw = localStorage.getItem('cc_seller_products') || '[]';
      const existingProducts = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as any[]) : [];
      localStorage.setItem('cc_seller_products', JSON.stringify([...existingProducts, productData]));
    } catch (err) {
      // if parse fails, overwrite with new array
      try {
        localStorage.setItem('cc_seller_products', JSON.stringify([productData]));
      } catch {
        console.error('Failed to save product in localStorage', err);
        alert('Failed to save product. Please try again.');
        return;
      }
    }

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
                type="button"
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
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Product Name *</label>
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Description *</label>
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Category *</label>
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter price"
                    min="1"
                    step="0.01"
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Material *</label>
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Weight (kg) *</label>
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Process *</label>
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
                      <h4 className="font-semibold text-green-800 mb-1">🌱 Environmental Impact Prediction</h4>
                      <p className="text-sm text-green-600">
                        This product will help buyers save approximately <strong>{co2Prediction}kg of CO₂</strong> compared to mass-produced alternatives.
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-green-700">{co2Prediction}kg</div>
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
