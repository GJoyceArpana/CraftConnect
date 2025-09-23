export interface ProductEcoData {
  weight_g: number;
  packaging_weight_g: number;
  distance_km_to_market: number;
  category: string;
  percent_recycled_material: number;
  production_method: 'handmade' | 'small-batch' | 'mass-produced';
}

export interface EcoImpactResult {
  carbon_footprint: number; // CO2 savings in kg
  sustainability_score: number; // Waste reduction percentage
}

export interface ProductEcoAnalysis extends ProductEcoData {
  id?: string;
  name: string;
  description: string;
  price: number;
}

class CarbonFootprintService {
  private baseUrl: string;

  constructor() {
    // Default to localhost:5000 for Flask backend
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  }

  // Get all products from backend
  async getAllProducts(): Promise<ProductEcoAnalysis[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Add a product to backend
  async addProduct(product: ProductEcoAnalysis): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Product added:', result.message);
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  }

  // Calculate eco impact for a product
  async calculateEcoImpact(productData: ProductEcoData): Promise<EcoImpactResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        carbon_footprint: result.carbon_footprint,
        sustainability_score: result.sustainability_score,
      };
    } catch (error) {
      console.error('Error calculating eco impact:', error);
      return null;
    }
  }

  // Calculate eco impact for multiple products
  async calculateBatchEcoImpact(products: ProductEcoData[]): Promise<EcoImpactResult[]> {
    const results: EcoImpactResult[] = [];
    
    for (const product of products) {
      const result = await this.calculateEcoImpact(product);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  // Get eco impact summary for user's purchased products
  async getUserEcoSummary(products: ProductEcoData[]): Promise<{
    totalCO2Saved: number;
    averageSustainabilityScore: number;
    totalProducts: number;
    topCategory: string;
  }> {
    const impacts = await this.calculateBatchEcoImpact(products);
    
    const totalCO2Saved = impacts.reduce((sum, impact) => sum + impact.carbon_footprint, 0);
    const averageSustainabilityScore = impacts.length > 0 
      ? impacts.reduce((sum, impact) => sum + impact.sustainability_score, 0) / impacts.length 
      : 0;

    // Find most common category
    const categoryCount: Record<string, number> = {};
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    
    const topCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'textiles'
    );

    return {
      totalCO2Saved: Math.round(totalCO2Saved * 100) / 100,
      averageSustainabilityScore: Math.round(averageSustainabilityScore * 10) / 10,
      totalProducts: products.length,
      topCategory,
    };
  }

  // Check if backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  // Convert frontend product to backend format
  convertProductToEcoData(product: any): ProductEcoData {
    // Default values based on product category if not provided
    const categoryDefaults: Record<string, Partial<ProductEcoData>> = {
      'terracotta': {
        weight_g: 800,
        packaging_weight_g: 50,
        distance_km_to_market: 150,
        percent_recycled_material: 30,
        production_method: 'handmade'
      },
      'jute': {
        weight_g: 200,
        packaging_weight_g: 20,
        distance_km_to_market: 100,
        percent_recycled_material: 60,
        production_method: 'handmade'
      },
      'textiles': {
        weight_g: 500,
        packaging_weight_g: 30,
        distance_km_to_market: 200,
        percent_recycled_material: 40,
        production_method: 'handmade'
      },
      'bamboo': {
        weight_g: 300,
        packaging_weight_g: 25,
        distance_km_to_market: 120,
        percent_recycled_material: 50,
        production_method: 'handmade'
      }
    };

    const defaults = categoryDefaults[product.category] || categoryDefaults['textiles'];

    return {
      weight_g: product.weight_g || defaults.weight_g!,
      packaging_weight_g: product.packaging_weight_g || defaults.packaging_weight_g!,
      distance_km_to_market: product.distance_km_to_market || defaults.distance_km_to_market!,
      category: product.category,
      percent_recycled_material: product.percent_recycled_material || defaults.percent_recycled_material!,
      production_method: product.production_method || defaults.production_method!,
    };
  }
}

export const carbonFootprintService = new CarbonFootprintService();
export default CarbonFootprintService;