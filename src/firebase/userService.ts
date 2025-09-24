import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc 
} from "firebase/firestore";
import { db } from "./config";

// User data types
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

// Collections
const BUYERS_COLLECTION = 'buyers';
const SELLERS_COLLECTION = 'sellers';

// User Service Functions
export class UserService {
  
  // Create a new buyer
  static async createBuyer(buyerData: Partial<BuyerProfile>): Promise<void> {
    if (!buyerData.phone) {
      throw new Error('Phone number is required');
    }
    
    const buyerRef = doc(db, BUYERS_COLLECTION, buyerData.phone);
    const newBuyer: BuyerProfile = {
      phone: buyerData.phone,
      password: buyerData.password || '',
      name: buyerData.name || '',
      email: buyerData.email || '',
      address: buyerData.address || '',
      isComplete: buyerData.isComplete || false,
      type: 'buyer',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    await setDoc(buyerRef, newBuyer);
  }
  
  // Create a new seller
  static async createSeller(sellerData: Partial<SellerProfile>): Promise<void> {
    if (!sellerData.phone) {
      throw new Error('Phone number is required');
    }
    
    const sellerRef = doc(db, SELLERS_COLLECTION, sellerData.phone);
    const newSeller: SellerProfile = {
      phone: sellerData.phone,
      password: sellerData.password || '',
      businessName: sellerData.businessName || '',
      ownerName: sellerData.ownerName || '',
      email: sellerData.email || '',
      address: sellerData.address || '',
      category: sellerData.category || '',
      description: sellerData.description || '',
      isComplete: sellerData.isComplete || false,
      type: 'seller',
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    await setDoc(sellerRef, newSeller);
  }
  
  // Get buyer by phone number
  static async getBuyer(phone: string): Promise<BuyerProfile | null> {
    const buyerRef = doc(db, BUYERS_COLLECTION, phone);
    const buyerSnap = await getDoc(buyerRef);
    
    if (buyerSnap.exists()) {
      return buyerSnap.data() as BuyerProfile;
    }
    return null;
  }
  
  // Get seller by phone number
  static async getSeller(phone: string): Promise<SellerProfile | null> {
    const sellerRef = doc(db, SELLERS_COLLECTION, phone);
    const sellerSnap = await getDoc(sellerRef);
    
    if (sellerSnap.exists()) {
      return sellerSnap.data() as SellerProfile;
    }
    return null;
  }
  
  // Update buyer profile
  static async updateBuyer(phone: string, updates: Partial<BuyerProfile>): Promise<void> {
    const buyerRef = doc(db, BUYERS_COLLECTION, phone);
    await updateDoc(buyerRef, {
      ...updates,
      lastLogin: new Date()
    });
  }
  
  // Update seller profile
  static async updateSeller(phone: string, updates: Partial<SellerProfile>): Promise<void> {
    const sellerRef = doc(db, SELLERS_COLLECTION, phone);
    await updateDoc(sellerRef, {
      ...updates,
      lastLogin: new Date()
    });
  }
  
  // Verify user login (check phone and password)
  static async verifyLogin(phone: string, password: string, userType: 'buyer' | 'seller'): Promise<UserProfile | null> {
    let user: UserProfile | null = null;
    
    if (userType === 'buyer') {
      user = await this.getBuyer(phone);
    } else {
      user = await this.getSeller(phone);
    }
    
    if (user && user.password === password) {
      // Update last login
      if (userType === 'buyer') {
        await this.updateBuyer(phone, { lastLogin: new Date() });
      } else {
        await this.updateSeller(phone, { lastLogin: new Date() });
      }
      return user;
    }
    
    return null;
  }
  
  // Check if user exists
  static async userExists(phone: string, userType: 'buyer' | 'seller'): Promise<boolean> {
    if (userType === 'buyer') {
      const buyer = await this.getBuyer(phone);
      return buyer !== null;
    } else {
      const seller = await this.getSeller(phone);
      return seller !== null;
    }
  }
  
  // Set user password after OTP verification
  static async setUserPassword(phone: string, password: string, userType: 'buyer' | 'seller'): Promise<void> {
    if (userType === 'buyer') {
      await this.updateBuyer(phone, { password });
    } else {
      await this.updateSeller(phone, { password });
    }
  }
  
  // Complete user profile
  static async completeProfile(phone: string, profileData: any, userType: 'buyer' | 'seller'): Promise<void> {
    const updates = {
      ...profileData,
      isComplete: true,
      lastLogin: new Date()
    };
    
    if (userType === 'buyer') {
      await this.updateBuyer(phone, updates);
    } else {
      await this.updateSeller(phone, updates);
    }
  }
}