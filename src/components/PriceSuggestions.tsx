import React, { useState, useEffect } from 'react';
import { 
  pricePredictionService, 
  PriceSuggestions as PriceSuggestionsType,
  PriceSuggestion,
  formatPrice,
  formatPriceRange,
  getConfidenceColor,
  getConfidenceIcon
} from '../services/pricePredictionApi';

interface PriceSuggestionsProps {
  formData: {
    category: string;
    material: string;
    weight: string;
    process: string;
    distanceToMarket: string;
    price?: string;
  };
  onPriceSelect?: (price: number) => void;
  hoursOfLabor?: number;
  className?: string;
}

const PriceSuggestions: React.FC<PriceSuggestionsProps> = ({
  formData,
  onPriceSelect,
  hoursOfLabor = 2,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<PriceSuggestionsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelAvailable, setModelAvailable] = useState(false);

  // Check if we have enough data to make predictions
  const canPredict = formData.category && formData.material && formData.process;

  useEffect(() => {
    checkModelStatus();
  }, []);

  useEffect(() => {
    if (canPredict && !loading) {
      fetchSuggestions();
    }
  }, [formData.category, formData.material, formData.process, formData.weight, formData.distanceToMarket, hoursOfLabor]);

  const checkModelStatus = async () => {
    try {
      const status = await pricePredictionService.checkModelStatus();
      setModelAvailable(status.model_available);
    } catch (err) {
      console.error('Error checking model status:', err);
    }
  };

  const fetchSuggestions = async () => {
    if (!canPredict) return;

    setLoading(true);
    setError(null);

    try {
      const priceInput = pricePredictionService.createPriceInput({
        ...formData,
        hours: hoursOfLabor
      });

      const result = await pricePredictionService.getPriceSuggestions(priceInput);
      setSuggestions(result);
    } catch (err: any) {
      setError(err.message || 'Failed to get price suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceSelect = (suggestion: PriceSuggestion) => {
    if (onPriceSelect) {
      onPriceSelect(suggestion.price);
    }
  };

  const handleRefresh = () => {
    fetchSuggestions();
  };

  if (!canPredict) {
    return (
      <div className={`p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-medium text-blue-800">AI Price Suggestions Available!</h4>
            <p className="text-sm text-blue-600">
              Fill in category, material, and process to get intelligent pricing recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h3 className="text-lg font-semibold text-gray-800">Getting AI Price Suggestions...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-medium text-red-800">Price Suggestions Unavailable</h4>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!suggestions || !suggestions.suggestions.length) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤔</span>
          <div>
            <h4 className="font-medium text-gray-700">No Suggestions Available</h4>
            <p className="text-sm text-gray-600">
              Unable to generate price suggestions for this product configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">AI Price Suggestions</h3>
              <p className="text-sm text-gray-600">
                {modelAvailable ? 'Powered by machine learning' : 'Rule-based suggestions'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh suggestions"
          >
            🔄
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer group"
              onClick={() => handlePriceSelect(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-700">
                      {suggestion.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {getConfidenceIcon(suggestion.confidence)} {suggestion.confidence.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {formatPrice(suggestion.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Range: {formatPriceRange(suggestion.range)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    {suggestion.reasoning}
                  </p>
                </div>
                
                <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    Use This Price
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <h4 className="font-medium text-gray-800">Price Range Summary</h4>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              Suggested price range: <strong>
                {formatPrice(Math.min(...suggestions.suggestions.map(s => s.range.min)))} - 
                {formatPrice(Math.max(...suggestions.suggestions.map(s => s.range.max)))}
              </strong>
            </p>
            <p className="mt-1">
              Most recommended: <strong>
                {formatPrice(suggestions.suggestions.find(s => s.confidence === 'high')?.price || suggestions.suggestions[0].price)}
              </strong>
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          💡 Click on any suggestion to use it as your product price. Prices are calculated based on materials, labor, market trends, and similar products.
        </div>
      </div>
    </div>
  );
};

export default PriceSuggestions;
