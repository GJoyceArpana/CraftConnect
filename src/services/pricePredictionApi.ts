/**
 * Price Prediction Service
 * Handles all interactions with the price prediction API
 */

// Base API URL - should match your backend server
const API_BASE_URL = 'http://localhost:5000';

// Types for price prediction data
export interface PriceInput {
  base_material_price: number;
  dimensions: number;
  hours_of_labor: number;
  transport_distance: number;
  region: string;
  category: string;
  crafting_process: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface PricePrediction {
  predicted_price: number;
  price_range: PriceRange;
  confidence: 'low' | 'medium' | 'high';
}

export interface PriceSuggestion {
  type: 'ml_prediction' | 'labor_based' | 'category_based';
  name: string;
  price: number;
  range: PriceRange;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface PriceSuggestions {
  base_price: number;
  suggestions: PriceSuggestion[];
}

export interface ModelStatus {
  model_available: boolean;
  model_path: string;
  catboost_available: boolean;
}

// API Response types
interface PredictPriceResponse {
  success: boolean;
  prediction?: PricePrediction;
  error?: string;
}

interface PriceSuggestionsResponse {
  success: boolean;
  suggestions?: PriceSuggestions;
  error?: string;
}

/**
 * Price Prediction Service Class
 */
export class PricePredictionService {
  private static instance: PricePredictionService;

  private constructor() {}

  public static getInstance(): PricePredictionService {
    if (!PricePredictionService.instance) {
      PricePredictionService.instance = new PricePredictionService();
    }
    return PricePredictionService.instance;
  }

  /**
   * Check if the price prediction model is available
   */
  async checkModelStatus(): Promise<ModelStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/price_model_status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking model status:', error);
      return {
        model_available: false,
        model_path: '',
        catboost_available: false
      };
    }
  }

  /**
   * Get AI-powered price prediction
   */
  async predictPrice(input: PriceInput): Promise<PricePrediction | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/predict_price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data: PredictPriceResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Price prediction failed');
      }

      return data.prediction || null;
    } catch (error) {
      console.error('Error predicting price:', error);
      return null;
    }
  }

  /**
   * Get comprehensive price suggestions (ML + rule-based)
   */
  async getPriceSuggestions(input: PriceInput): Promise<PriceSuggestions | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/price_suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data: PriceSuggestionsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Price suggestions failed');
      }

      return data.suggestions || null;
    } catch (error) {
      console.error('Error getting price suggestions:', error);
      return null;
    }
  }

  /**
   * Helper method to convert form data to PriceInput format
   */
  createPriceInput(formData: {
    material?: string;
    category?: string;
    process?: string;
    weight?: string | number;
    distanceToMarket?: string | number;
    packagingWeight?: string | number;
    price?: string | number;
    hours?: string | number;
    region?: string;
  }): PriceInput {
    // Extract material price from overall price or provide default
    const basePrice = typeof formData.price === 'string' 
      ? parseFloat(formData.price) || 50
      : (formData.price || 50);

    // Calculate dimensions from weight (rough estimate)
    const weight = typeof formData.weight === 'string' 
      ? parseFloat(formData.weight) 
      : (formData.weight || 1);
    
    const hours = typeof formData.hours === 'string'
      ? parseFloat(formData.hours)
      : (formData.hours || 2);

    const distance = typeof formData.distanceToMarket === 'string'
      ? parseFloat(formData.distanceToMarket)
      : (formData.distanceToMarket || 50);

    return {
      base_material_price: Math.max(basePrice * 0.4, 20), // Assume materials are ~40% of total price
      dimensions: weight * 150, // Rough estimation: 1kg = 150 cm²
      hours_of_labor: hours,
      transport_distance: distance,
      region: formData.region || 'Central',
      category: formData.category || 'crafts',
      crafting_process: formData.process || 'handmade'
    };
  }

  /**
   * Simplified method for getting quick price estimate
   */
  async getQuickEstimate(
    category: string,
    material: string,
    hours: number,
    basePrice: number,
    region: string = 'Central'
  ): Promise<PricePrediction | null> {
    const input: PriceInput = {
      base_material_price: basePrice,
      dimensions: 120, // Default size
      hours_of_labor: hours,
      transport_distance: 50, // Default distance
      region,
      category: category.toLowerCase(),
      crafting_process: 'handmade'
    };

    return this.predictPrice(input);
  }
}

// Export singleton instance
export const pricePredictionService = PricePredictionService.getInstance();

// Helper functions for UI components
export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPriceRange = (range: PriceRange): string => {
  return `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
};

export const getConfidenceColor = (confidence: string): string => {
  switch (confidence) {
    case 'high': return 'text-green-700 bg-green-100';
    case 'medium': return 'text-yellow-700 bg-yellow-100';
    case 'low': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

export const getConfidenceIcon = (confidence: string): string => {
  switch (confidence) {
    case 'high': return '✅';
    case 'medium': return '⚠️';
    case 'low': return '❌';
    default: return 'ℹ️';
  }
};

export default pricePredictionService;