const API_BASE_URL = 'http://127.0.0.1:5000';

export interface Product {
  name: string;
  category: string;
  weight_g: number;
  packaging_weight_g: number;
  distance_km_to_market: number;
  percent_recycled_material: number;
  production_method: string;
  materials?: string;
}

export interface EcoImpactPrediction {
  carbon_footprint: number;
  sustainability_score: number;
}

export interface FairPriceSuggestion {
  suggested_price: number;
  category: string;
  materials: string;
  hours: number;
  base_price: number;
}

export interface ProductAnalysis {
  eco_impact?: EcoImpactPrediction & { error?: string };
  fair_pricing?: FairPriceSuggestion & { error?: string };
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  suggestions?: string[];
  timestamp?: string;
  error?: string;
  fallback_response?: string;
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis?: string;
  suggestions?: Array<{
    category: string;
    action: string;
    description: string;
    impact: string;
    difficulty: string;
  }>;
  timestamp?: string;
  error?: string;
  fallback_suggestions?: string[];
}

export interface ParameterSuggestionsResponse {
  success: boolean;
  parameter_suggestions?: string;
  parsed_changes?: Record<string, any>;
  target_area?: string;
  error?: string;
  fallback_suggestions?: Record<string, string>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.fetchApi<Product[]>('/products');
  }

  async addProduct(product: Product): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async predictEcoImpact(product: Omit<Product, 'name' | 'materials'> & { include_recommendations?: boolean }): Promise<ApiResponse<EcoImpactPrediction & { ai_recommendations?: AIAnalysisResponse }>> {
    return this.fetchApi<EcoImpactPrediction & { ai_recommendations?: AIAnalysisResponse }>('/predict', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async getApiStatus(): Promise<ApiResponse<{ message: string; endpoints: string[]; features: any }>> {
    return this.fetchApi('/');
  }

  async suggestFairPrice(data: {
    category: string;
    materials: string;
    hours?: number;
    base_price?: number;
  }): Promise<ApiResponse<FairPriceSuggestion>> {
    return this.fetchApi<FairPriceSuggestion>('/fair-price', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProductAnalysis(product: Product & { 
    production_hours?: number;
    base_price?: number;
  }): Promise<ApiResponse<ProductAnalysis>> {
    return this.fetchApi<ProductAnalysis>('/product-analysis', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  // AI Chatbot Endpoints
  async chatWithAI(message: string, context?: {
    product_data?: Partial<Product>;
    current_impact?: Partial<EcoImpactPrediction>;
    conversation_history?: string;
  }): Promise<ApiResponse<ChatResponse>> {
    return this.fetchApi<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getAIAnalysis(product_data: Partial<Product>, current_impact: Partial<EcoImpactPrediction>): Promise<ApiResponse<AIAnalysisResponse>> {
    return this.fetchApi<AIAnalysisResponse>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ product_data, current_impact }),
    });
  }

  async getParameterSuggestions(current_params: Partial<Product>, target_improvement?: string): Promise<ApiResponse<ParameterSuggestionsResponse>> {
    return this.fetchApi<ParameterSuggestionsResponse>('/ai/parameter-suggestions', {
      method: 'POST',
      body: JSON.stringify({ current_params, target_improvement: target_improvement || 'overall' }),
    });
  }

  async getQuickTips(category?: string): Promise<ApiResponse<ChatResponse>> {
    return this.fetchApi<ChatResponse>('/ai/quick-tips', {
      method: 'POST',
      body: JSON.stringify({ category: category || 'general' }),
    });
  }
}

export const apiService = new ApiService();
