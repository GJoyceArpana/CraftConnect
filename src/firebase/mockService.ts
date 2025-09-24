// Mock Firebase service to prevent import errors
// This allows the website to work without Firebase dependencies

export interface BuyerProfile {
  phone: string;
  password: string;
  name?: string;
  email?: string;
  address?: string;
  isComplete: boolean;
  type: 'buyer';
  createdAt: Date;
  lastLogin: Date;
}

export interface SellerProfile {
  phone: string;
  password: string;
  businessName?: string;
  ownerName?: string;
  email?: string;
  address?: string;
  category?: string;
  description?: string;
  isComplete: boolean;
  type: 'seller';
  createdAt: Date;
  lastLogin: Date;
}

export type UserProfile = BuyerProfile | SellerProfile;

// Mock UserService that works without Firebase
export class UserService {
  
  static async createBuyer(buyerData: Partial<BuyerProfile>): Promise<void> {
    console.log('Mock: Creating buyer', buyerData);
    // Store in localStorage as fallback
    const buyers = JSON.parse(localStorage.getItem('cc_buyers') || '[]');
    buyers.push({
      ...buyerData,
      createdAt: new Date(),
      lastLogin: new Date(),
      type: 'buyer'
    });
    localStorage.setItem('cc_buyers', JSON.stringify(buyers));
  }
  
  static async createSeller(sellerData: Partial<SellerProfile>): Promise<void> {
    console.log('Mock: Creating seller', sellerData);
    // Store in localStorage as fallback
    const sellers = JSON.parse(localStorage.getItem('cc_sellers') || '[]');
    sellers.push({
      ...sellerData,
      createdAt: new Date(),
      lastLogin: new Date(),
      type: 'seller'
    });
    localStorage.setItem('cc_sellers', JSON.stringify(sellers));
  }
  
  static async getBuyer(phone: string): Promise<BuyerProfile | null> {
    const buyers = JSON.parse(localStorage.getItem('cc_buyers') || '[]');
    return buyers.find((b: BuyerProfile) => b.phone === phone) || null;
  }
  
  static async getSeller(phone: string): Promise<SellerProfile | null> {
    const sellers = JSON.parse(localStorage.getItem('cc_sellers') || '[]');
    return sellers.find((s: SellerProfile) => s.phone === phone) || null;
  }
  
  static async updateBuyer(phone: string, updates: Partial<BuyerProfile>): Promise<void> {
    console.log('Mock: Updating buyer', phone, updates);
  }
  
  static async updateSeller(phone: string, updates: Partial<SellerProfile>): Promise<void> {
    console.log('Mock: Updating seller', phone, updates);
  }
  
  static async verifyLogin(phone: string, password: string, userType: 'buyer' | 'seller'): Promise<UserProfile | null> {
    console.log('Mock: Verifying login', phone, userType);
    // For demo purposes, return a mock user
    if (userType === 'buyer') {
      return {
        phone,
        password,
        name: 'Demo Buyer',
        isComplete: true,
        type: 'buyer',
        createdAt: new Date(),
        lastLogin: new Date()
      };
    } else {
      return {
        phone,
        password,
        businessName: 'Demo Craft Business',
        ownerName: 'Demo Seller',
        isComplete: true,
        type: 'seller',
        createdAt: new Date(),
        lastLogin: new Date()
      };
    }
  }
  
  static async userExists(phone: string, userType: 'buyer' | 'seller'): Promise<boolean> {
    console.log('Mock: Checking if user exists', phone, userType);
    return false; // For demo, assume user doesn't exist
  }
  
  static async setUserPassword(phone: string, password: string, userType: 'buyer' | 'seller'): Promise<void> {
    console.log('Mock: Setting password', phone, userType);
  }
  
  static async completeProfile(phone: string, profileData: any, userType: 'buyer' | 'seller'): Promise<void> {
    console.log('Mock: Completing profile', phone, userType, profileData);
  }
}
