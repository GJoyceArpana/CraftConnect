// src/CreateProduct.tsx
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
  price: string; // final price (user editable)
  category: string;
  material: string;
  weight: string; // kept for backward compatibility if needed
  process: string; // kept for backward compatibility if needed
  productImage?: string | null;
};

const categories = [
  { id: 'terracotta', name: 'Terracotta' },
  { id: 'jute', name: 'Jute & Bags' },
  { id: 'textiles', name: 'Textiles' },
  { id: 'bamboo', name: 'Bamboo & Wood' }
];

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

  // Estimate-specific state (separate box)
  const [estCategory, setEstCategory] = useState<string>(''); // selected category for estimate
  const [estMaterial, setEstMaterial] = useState<string>(''); // material input for estimate
  const [estHours, setEstHours] = useState<string>(''); // hours of work as string (controlled input)
  const [estBasePrice, setEstBasePrice] = useState<string>(''); // base price input for estimate

  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  // Replace with your backend endpoint
  const ESTIMATE_API = '/api/estimate-price';

  // Generic form input handler for main product form
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image upload (unchanged)
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Fetch estimate from backend
  const fetchEstimatedPrice = async () => {
    // Validate estimate inputs first
    if (!estCategory) {
      setEstimateError('Please select a category for estimate.');
      setEstimatedPrice(null);
      return;
    }
    if (!estMaterial.trim()) {
      setEstimateError('Please enter material for estimate.');
      setEstimatedPrice(null);
      return;
    }
    const hoursNum = parseFloat(estHours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setEstimateError('Please enter valid hours of work (> 0).');
      setEstimatedPrice(null);
      return;
    }
    const baseNum = parseFloat(estBasePrice);
    if (isNaN(baseNum) || baseNum < 0) {
      setEstimateError('Please enter a valid base price (>= 0).');
      setEstimatedPrice(null);
      return;
    }

    setEstimating(true);
    setEstimateError(null);
    setEstimatedPrice(null);

    try {
      const payload = {
        category: estCategory,
        material: estMaterial,
        hours: hoursNum,
        basePrice: baseNum
      };

      const res = await fetch(ESTIMATE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Estimate service returned ${res.status}`);
      }

      const data = await res.json();
      // Expecting { estimatedPrice: number } from backend
      if (data && (typeof data.estimatedPrice === 'number' || typeof data.estimatedPrice === 'string')) {
        const val = typeof data.estimatedPrice === 'number' ? data.estimatedPrice : parseFloat(data.estimatedPrice);
        if (!isNaN(val)) {
          setEstimatedPrice(Math.round(val * 100) / 100);
        } else {
          throw new Error('Invalid estimate value');
        }
      } else {
        throw new Error('Invalid response from estimate service');
      }
    } catch (err: any) {
      console.error('Estimate fetch failed', err);
      setEstimateError(err?.message || 'Failed to fetch estimate');
    } finally {
      setEstimating(false);
    }
  };

  // Use estimate as the final product price (copies into form)
  const applyEstimateAsPrice = () => {
    if (estimatedPrice === null) return;
    setFormData(prev => ({ ...prev, price: String(estimatedPrice) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // basic product validations
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
      alert('Please enter a valid final price');
      return;
    }

    // Build product object
    const productData = {
      ...formData,
      id: Date.now().toString(),
      sellerId: user?.id ?? null,
      sellerName: user?.name ?? 'Unknown Seller',
      price: priceNum,
      createdAt: new Date().toISOString(),
      image: formData.productImage ?? 'https://images.pexels.com/photos/6474306/pexels-photo-6474306.jpeg?auto=compress&cs=tinysrgb&w=400'
    };

    // Save to localStorage (defensive)
    try {
      const raw = localStorage.getItem('cc_seller_products') || '[]';
      const existingProducts = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as any[]) : [];
      localStorage.setItem('cc_seller_products', JSON.stringify([...existingProducts, productData]));
    } catch (err) {
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
                    onChange={(e) => handleInputChange(e)}
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
                    onChange={(e) => handleInputChange(e)}
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
                    onChange={(e) => handleInputChange(e)}
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
                  <label className="block text-sm font-medium text-[#333] mb-2">Final Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange(e)}
                    className="input-field"
                    placeholder="Enter final price"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sustainability Information (kept fields but not auto-calculated) */}
            <div>
              <h3 className="text-lg font-semibold text-[#333] mb-4">
                Product Details
                <span className="text-sm font-normal text-[#666] ml-2">(used for estimate & listing)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">Material *</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={(e) => handleInputChange(e)}
                    className="input-field"
                    placeholder="e.g., Clay, Jute, Cotton"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={(e) => handleInputChange(e)}
                    className="input-field"
                    placeholder="Product weight (optional)"
                    step="0.1"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333] mb-2">Process</label>
                  <input
                    type="text"
                    name="process"
                    value={formData.process}
                    onChange={(e) => handleInputChange(e)}
                    className="input-field"
                    placeholder="e.g., Handmade, Traditional (optional)"
                  />
                </div>
              </div>
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

        {/* ---------- Estimate Panel (separate box) ---------- */}
        <div className="mt-6">
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-[#333] mb-4">Get Estimated Price </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">Category</label>
                <select
                  value={estCategory}
                  onChange={(e) => setEstCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">Material</label>
                <input
                  type="text"
                  value={estMaterial}
                  onChange={(e) => setEstMaterial(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Clay, Jute, Cotton"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">Hours of Work</label>
                <input
                  type="number"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                  className="input-field"
                  placeholder="Enter hours"
                  step="0.1"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">Base Price (₹)</label>
                <input
                  type="number"
                  value={estBasePrice}
                  onChange={(e) => setEstBasePrice(e.target.value)}
                  className="input-field"
                  placeholder="Base cost / material cost"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="p-4 rounded-lg border border-gray-200 bg-white">
                  {estimating ? (
                    <div className="text-sm text-[#666]">Calculating estimate... ⏳</div>
                  ) : estimateError ? (
                    <div className="text-sm text-red-600">Error: {estimateError}</div>
                  ) : estimatedPrice !== null ? (
                    <div className="flex items-baseline gap-3">
                      <div className="text-3xl font-bold text-[#154731]">₹{estimatedPrice}</div>
                      <div className="text-sm text-[#666]">Estimated price</div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#666]">Fill category, material, hours and base price, then click Get Estimate.</div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3">
                <button
                  type="button"
                  onClick={fetchEstimatedPrice}
                  className="hero-button w-full md:w-auto"
                  disabled={estimating}
                >
                  {estimating ? 'Estimating...' : 'Get Estimate'}
                </button>

                <button
                  type="button"
                  onClick={applyEstimateAsPrice}
                  className="btn-secondary w-full md:w-auto"
                  disabled={estimatedPrice === null}
                >
                  Use estimate as final price
                </button>

                <div className="mt-2 text-sm text-[#666]">
                  Current final price: {formData.price ? `₹${formData.price}` : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ---------- End Estimate Panel ---------- */}
      </div>
    </div>
  );
};

export default CreateProduct;
