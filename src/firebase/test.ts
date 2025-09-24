// Simple Firebase connection test
import { db } from './config';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test writing to Firestore
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, {
      message: 'Firebase connection test',
      timestamp: new Date(),
      status: 'working'
    });
    
    console.log('✅ Write to Firestore successful');
    
    // Test reading from Firestore
    const docSnap = await getDoc(testRef);
    
    if (docSnap.exists()) {
      console.log('✅ Read from Firestore successful:', docSnap.data());
      return { success: true, message: 'Firebase connection working!' };
    } else {
      console.log('❌ No document found');
      return { success: false, message: 'Document not found' };
    }
    
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return { success: false, message: `Firebase error: ${error}` };
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testFirebase = testFirebaseConnection;
}
