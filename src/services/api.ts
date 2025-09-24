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

  async predictEcoImpact(product: Omit<Product, 'name' | 'materials'>): Promise<ApiResponse<EcoImpactPrediction>> {
    return this.fetchApi<EcoImpactPrediction>('/predict', {
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
}

export const apiService = new ApiService();
