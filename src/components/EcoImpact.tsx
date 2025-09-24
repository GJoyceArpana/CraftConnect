import React, { useState } from 'react';
import { Leaf, TrendingDown, AlertCircle } from 'lucide-react';
import { apiService, type Product, type EcoImpactPrediction } from '../services/api';

interface EcoImpactProps {
  product?: Partial<Product>;
  onImpactCalculated?: (impact: EcoImpactPrediction) => void;
  onNavigate?: (route: string) => void;
}

export const EcoImpact: React.FC<EcoImpactProps> = ({ product, onImpactCalculated, onNavigate }) => {
  const [impact, setImpact] = useState<EcoImpactPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateImpact = async (productData: Partial<Product>) => {
    if (!productData.category || !productData.weight_g || !productData.packaging_weight_g || 
        !productData.distance_km_to_market || productData.percent_recycled_material === undefined || 
        !productData.production_method) {
      setError('Please provide all required product details');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await apiService.predictEcoImpact({
      category: productData.category,
      weight_g: productData.weight_g,
      packaging_weight_g: productData.packaging_weight_g,
      distance_km_to_market: productData.distance_km_to_market,
      percent_recycled_material: productData.percent_recycled_material,
      production_method: productData.production_method,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setImpact(result.data);
      onImpactCalculated?.(result.data);
    }

    setLoading(false);
  };

  React.useEffect(() => {
    if (product) {
      calculateImpact(product);
    }
  }, [product]);

  const getSustainabilityColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Calculating eco impact...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Error calculating eco impact</span>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-gray-500">
          <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Provide product details to see eco impact analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Leaf className="h-6 w-6 text-green-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Eco Impact Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carbon Footprint */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingDown className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-900">Carbon Footprint</h4>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {impact.carbon_footprint} <span className="text-sm font-normal">kg CO₂</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            CO₂ emissions reduced vs factory production
          </p>
        </div>

        {/* Sustainability Score */}
        <div className={`p-4 rounded-lg ${getSustainabilityColor(impact.sustainability_score)}`}>
          <div className="flex items-center mb-2">
            <Leaf className="h-5 w-5 mr-2" />
            <h4 className="font-medium">Sustainability Score</h4>
          </div>
          <div className="text-2xl font-bold">
            {impact.sustainability_score}<span className="text-sm font-normal">%</span>
          </div>
          <p className="text-sm mt-1">
            {getSustainabilityLabel(impact.sustainability_score)} sustainability rating
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h5 className="font-medium text-green-900 mb-2">Environmental Benefits</h5>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Supports traditional artisan communities</li>
          <li>• Reduces industrial manufacturing emissions</li>
          <li>• Promotes sustainable material usage</li>
          <li>• Minimizes packaging waste through local sourcing</li>
        </ul>
      </div>
    </div>
  );
};