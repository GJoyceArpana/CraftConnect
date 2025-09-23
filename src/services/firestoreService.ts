import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserData {
  id?: string;
  phone: string;
  password?: string;
  name?: string;
  email?: string;
  address?: string;
  userType: 'buyer' | 'seller';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sellerId: string;
  imageUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

class FirestoreService {
  // User operations
  async createUser(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const userWithDates: Omit<UserData, 'id'> = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'users'), userWithDates);
      console.log('User created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUserByPhone(phone: string): Promise<UserData | null> {
    try {
      const q = query(collection(db, 'users'), where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<UserData>): Promise<boolean> {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
      console.log('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  // Product operations
  async createProduct(productData: Omit<ProductData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const productWithDates: Omit<ProductData, 'id'> = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'products'), productWithDates);
      console.log('Product created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  async getProductsByUserId(sellerId: string): Promise<ProductData[]> {
    try {
      const q = query(collection(db, 'products'), where('sellerId', '==', sellerId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductData[];
    } catch (error) {
      console.error('Error getting products by user ID:', error);
      return [];
    }
  }

  async getAllProducts(): Promise<ProductData[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductData[];
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  async getProductById(productId: string): Promise<ProductData | null> {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ProductData;
      }
      return null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  async updateProduct(productId: string, updates: Partial<ProductData>): Promise<boolean> {
    try {
      const docRef = doc(db, 'products', productId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
      console.log('Product updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
      console.log('Product deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }
}

export const firestoreService = new FirestoreService();
export default FirestoreService;