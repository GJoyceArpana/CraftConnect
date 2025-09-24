import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Leaf, Package, MapPin, Home, ArrowLeft } from 'lucide-react';
import { apiService, type Product } from '../services/api';
import { EcoImpact } from './EcoImpact';

interface ProductsProps {
  onNavigate?: (route: string) => void;
}

export const Products: React.FC<ProductsProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    category: '',
    weight_g: 0,
    packaging_weight_g: 0,
    distance_km_to_market: 0,
    percent_recycled_material: 0,
    production_method: '',
    materials: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const result = await apiService.getProducts();
    
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setProducts(result.data);
    }
    setLoading(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiService.addProduct(newProduct);
    
    if (result.error) {
      alert(`Error adding product: ${result.error}`);
    } else {
      alert('Product added successfully!');
      setNewProduct({
        name: '',
        category: '',
        weight_g: 0,
        packaging_weight_g: 0,
        distance_km_to_market: 0,
        percent_recycled_material: 0,
        production_method: '',
        materials: '',
      });
      setShowAddForm(false);
      loadProducts(); // Refresh the list
    }
  };

  const categories = ['textiles', 'bamboo', 'terracotta', 'toys', 'painting'];
  const productionMethods = ['handmade', 'small-batch', 'factory'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center mb-6">
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
          )}
          <nav className="text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer" onClick={() => onNavigate?.('home')}>Home</span>
            <span className="mx-2">•</span>
            <span className="text-gray-900 font-medium">Products & Eco Impact</span>
          </nav>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Sustainable Products</h1>
          </div>
          <div className="flex items-center space-x-4">
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </button>
            )}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Add Product Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Weight (grams)"
                  value={newProduct.weight_g || ''}
                  onChange={(e) => setNewProduct({...newProduct, weight_g: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                  required
                />

                <input
                  type="number"
                  placeholder="Packaging Weight (grams)"
                  value={newProduct.packaging_weight_g || ''}
                  onChange={(e) => setNewProduct({...newProduct, packaging_weight_g: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                  required
                />

                <input
                  type="number"
                  placeholder="Distance to Market (km)"
                  value={newProduct.distance_km_to_market || ''}
                  onChange={(e) => setNewProduct({...newProduct, distance_km_to_market: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                  required
                />

                <input
                  type="number"
                  placeholder="Recycled Material (%)"
                  value={newProduct.percent_recycled_material || ''}
                  onChange={(e) => setNewProduct({...newProduct, percent_recycled_material: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                  min="0"
                  max="100"
                  required
                />

                <select
                  value={newProduct.production_method}
                  onChange={(e) => setNewProduct({...newProduct, production_method: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Production Method</option>
                  {productionMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Materials (optional)"
                  value={newProduct.materials}
                  onChange={(e) => setNewProduct({...newProduct, materials: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {product.category}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  {product.weight_g}g ({product.production_method})
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {product.distance_km_to_market}km to market
                </div>
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-2" />
                  {product.percent_recycled_material}% recycled materials
                </div>
              </div>

              <button
                onClick={() => setSelectedProduct(product)}
                className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
              >
                View Eco Impact
              </button>
            </div>
          ))}
        </div>

        {/* Eco Impact Display */}
        {selectedProduct && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Eco Impact Analysis for "{selectedProduct.name}"
              </h2>
              <div className="flex items-center space-x-3">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('home')}
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-300 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </button>
                )}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </button>
              </div>
            </div>
            <EcoImpact product={selectedProduct} onNavigate={onNavigate} />
          </div>
        )}
        
        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex justify-center">
            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Return to CraftConnect Home
              </button>
            )}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Discover sustainable, handcrafted products with transparent environmental impact
          </p>
        </div>
      </div>
    </div>
  );
};
