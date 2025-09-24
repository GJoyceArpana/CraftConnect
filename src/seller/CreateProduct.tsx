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
 * Calculate CO2 impact using the backend API
 */
const calculateCO2ImpactAPI = async (formData: FormState): Promise<CarbonFootprintResponse | null> => {
  try {
    const weightInGrams = parseFloat(formData.weight) * 1000; // convert kg to grams
    const packagingWeightInGrams = parseFloat(formData.packagingWeight || '0') * 1000;
    const recycledPercent = parseFloat(formData.recycledMaterial || '0');
    const distanceKm = parseFloat(formData.distanceToMarket || '50'); // default 50km

    const apiPayload = {
      weight_g: weightInGrams,
      packaging_weight_g: packagingWeightInGrams,
      distance_km_to_market: distanceKm,
      category: formData.category,
      percent_recycled_material: recycledPercent,
      production_method: formData.process.toLowerCase(),
      materials: formData.material,
      name: formData.name
    };

    const response = await fetch('http://127.0.0.1:5000/carbon_footprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiPayload)
    });

    if (!response.ok) {
      throw new Error('Failed to get carbon footprint calculation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    return null;
  }
};

/**
 * Fallback simple CO2 calculation for when API is not available
 */
const calculateCO2ImpactFallback = (material: string, weightStr: string, process: string): number => {
  const baseCO2 = parseFloat(weightStr) || 1;
  const materialMultiplier: Record<string, number> = {
    clay: 0.8,
    cotton: 0.9,
    bamboo: 1.5,
    wood: 1.3
  };
  const processMultiplier: Record<string, number> = {
    handmade: 2.0,
    traditional: 1.8,
    'small-batch': 2.2
  };

  const materialKey = (material || '').toLowerCase();
  const processKey = (process || '').toLowerCase();

  const materialFactor = materialMultiplier[materialKey] ?? 1.0;
  const processFactor = processMultiplier[processKey] ?? 1.0;

  const raw = baseCO2 * materialFactor * processFactor;
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
    productImage: null,
    packagingWeight: '0.05', // default 50g packaging
    distanceToMarket: '50', // default 50km
    recycledMaterial: '0' // default 0% recycled
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [co2Prediction, setCo2Prediction] = useState<number>(0);
  const [sustainabilityScore, setSustainabilityScore] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // calculate CO2 prediction when relevant fields change
      if (['category', 'material', 'weight', 'process', 'packagingWeight', 'distanceToMarket', 'recycledMaterial'].includes(name)) {
        // Debounce API calls to avoid too many requests
        setTimeout(async () => {
          if (updated.category && updated.weight && updated.process) {
            setIsCalculating(true);
            const result = await calculateCO2ImpactAPI(updated);
            if (result) {
              setCo2Prediction(result.co2_saving_kg);
              setSustainabilityScore(result.waste_reduction_pct);
            } else {
              // Fallback to simple calculation
              const fallback = calculateCO2ImpactFallback(updated.material, updated.weight, updated.process);
              setCo2Prediction(fallback);
              setSustainabilityScore(0);
            }
            setIsCalculating(false);
          }
        }, 500); // 500ms debounce
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

  const handleSubmit = async (e: FormEvent) => {
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

    // Get final carbon footprint calculation
    let finalCarbonData = {
      co2Prediction: co2Prediction || calculateCO2ImpactFallback(formData.material, formData.weight, formData.process),
      sustainabilityScore,
      co2SavingKg: co2Prediction,
      wasteReductionPct: sustainabilityScore
    };

    if (!co2Prediction) {
      // Try one more API call if we don't have data
      const result = await calculateCO2ImpactAPI(formData);
      if (result) {
        finalCarbonData = {
          co2Prediction: result.co2_saving_kg,
          sustainabilityScore: result.waste_reduction_pct,
          co2SavingKg: result.co2_saving_kg,
          wasteReductionPct: result.waste_reduction_pct
        };
      }
    }

    // Build product object
    const productData = {
      ...formData,
      id: Date.now().toString(),
      sellerId: user?.id ?? null,
      sellerName: user?.name ?? 'Unknown Seller',
      price: priceNum,
      weight: parseFloat(formData.weight), // convert to number
      packagingWeight: parseFloat(formData.packagingWeight),
      distanceToMarket: parseFloat(formData.distanceToMarket),
      recycledMaterial: parseFloat(formData.recycledMaterial),
      ...finalCarbonData,
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
                  <select
                    name="process"
                    value={formData.process}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select production method</option>
                    <option value="handmade">Handmade</option>
                    <option value="small-batch">Small-batch</option>
                    <option value="traditional">Traditional</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">Packaging Weight (kg)</label>
                  <input
                    type="number"
                    name="packagingWeight"
                    value={formData.packagingWeight}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0.05"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">Distance to Market (km)</label>
                  <input
                    type="number"
                    name="distanceToMarket"
                    value={formData.distanceToMarket}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="50"
                    step="1"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">Recycled Material (%)</label>
                  <input
                    type="number"
                    name="recycledMaterial"
                    value={formData.recycledMaterial}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0"
                    step="1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Environmental Impact Prediction Display */}
              {isCalculating && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 font-medium">Calculating environmental impact...</span>
                  </div>
                </div>
              )}
              
              {!isCalculating && (co2Prediction > 0 || sustainabilityScore > 0) && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 text-lg">🌱 Environmental Impact Assessment</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-300">
                      <div>
                        <h5 className="font-semibold text-green-800 mb-1">CO₂ Savings</h5>
                        <p className="text-sm text-green-600">
                          vs. mass production
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{co2Prediction.toFixed(2)} kg</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-300">
                      <div>
                        <h5 className="font-semibold text-green-800 mb-1">Sustainability Score</h5>
                        <p className="text-sm text-green-600">
                          waste reduction potential
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{sustainabilityScore.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Eco-friendly choice!</strong> This handcrafted product supports sustainable production methods and helps reduce environmental impact.
                    </p>
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
