/**
 * Firebase API service for real-time data
 * Handles communication with Firebase backend
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  material: string;
  weight: number;
  process: string;
  seller_id: string;
  seller_name: string;
  image: string;
  packaging_weight: number;
  distance_to_market: number;
  recycled_material: number;
  co2_prediction: number;
  sustainability_score: number;
  co2_saving_kg: number;
  waste_reduction_pct: number;
  created_at: any;
  status: string;
  views: number;
  likes: number;
}

export interface DashboardData {
  products_listed: number;
  total_sold: number;
  revenue_earned: number;
  total_co2_saved: number;
  orders_placed: number;
  amount_saved: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  amount_saved: number;
  status: string;
  created_at: any;
}

class FirebaseApiService {
  async createProduct(productData: any): Promise<{ success: boolean; product_id?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true, product_id: result.product_id };
      } else {
        return { success: false, error: result.error || 'Failed to create product' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  }

  async getProducts(filters?: { category?: string; seller_id?: string }, limit = 20): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.seller_id) params.append('seller_id', filters.seller_id);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.products || [];
      } else {
        console.error('Failed to get products:', result.error);
        return [];
      }
    } catch (error: any) {
      console.error('Network error getting products:', error);
      return [];
    }
  }

  async searchProducts(searchTerm: string, category?: string, limit = 20): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      if (category) params.append('category', category);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/products/search?${params}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.products || [];
      } else {
        console.error('Failed to search products:', result.error);
        return [];
      }
    } catch (error: any) {
      console.error('Network error searching products:', error);
      return [];
    }
  }

  async createOrder(orderData: any): Promise<{ success: boolean; order_id?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true, order_id: result.order_id };
      } else {
        return { success: false, error: result.error || 'Failed to create order' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  }

  async getSellerDashboardData(sellerId: string): Promise<DashboardData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/seller/${sellerId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.data;
      } else {
        console.error('Failed to get seller dashboard data:', result.error);
        return null;
      }
    } catch (error: any) {
      console.error('Network error getting seller dashboard data:', error);
      return null;
    }
  }

  async getBuyerDashboardData(buyerId: string): Promise<DashboardData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/buyer/${buyerId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.data;
      } else {
        console.error('Failed to get buyer dashboard data:', result.error);
        return null;
      }
    } catch (error: any) {
      console.error('Network error getting buyer dashboard data:', error);
      return null;
    }
  }

  async createUser(userData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to create user' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  }

  async getUser(userId: string): Promise<any | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        return result.user;
      } else {
        console.error('Failed to get user:', result.error);
        return null;
      }
    } catch (error: any) {
      console.error('Network error getting user:', error);
      return null;
    }
  }

  // Helper method to get products for marketplace (buyers)
  async getMarketplaceProducts(category?: string, limit = 20): Promise<Product[]> {
    return this.getProducts({ category }, limit);
  }

  // Helper method to get seller's own products
  async getSellerProducts(sellerId: string, limit = 50): Promise<Product[]> {
    return this.getProducts({ seller_id: sellerId }, limit);
  }
}

// Export singleton instance
export const firebaseApi = new FirebaseApiService();
export default firebaseApi;