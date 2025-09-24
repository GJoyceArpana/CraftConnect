import { doc, deleteDoc } from "firebase/firestore";
import { db } from "./config";

// Admin utilities for testing (remove in production)
export class AdminUtils {
  
  // Reset a buyer account (for testing purposes)
  static async resetBuyer(phone: string): Promise<void> {
    try {
      const buyerRef = doc(db, 'buyers', phone);
      await deleteDoc(buyerRef);
      console.log(`Buyer account ${phone} has been reset.`);
    } catch (error) {
      console.error('Error resetting buyer:', error);
      throw error;
    }
  }
  
  // Reset a seller account (for testing purposes)
  static async resetSeller(phone: string): Promise<void> {
    try {
      const sellerRef = doc(db, 'sellers', phone);
      await deleteDoc(sellerRef);
      console.log(`Seller account ${phone} has been reset.`);
    } catch (error) {
      console.error('Error resetting seller:', error);
      throw error;
    }
  }
  
  // Reset both buyer and seller accounts
  static async resetAllAccounts(phone: string): Promise<void> {
    try {
      await this.resetBuyer(phone);
      await this.resetSeller(phone);
      console.log(`All accounts for ${phone} have been reset.`);
    } catch (error) {
      console.error('Error resetting accounts:', error);
    }
  }
}

// For development console access
if (typeof window !== 'undefined') {
  (window as any).AdminUtils = AdminUtils;
}