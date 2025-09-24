import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test writing to Firestore
    const testRef = doc(db, 'test', 'connection');
    await setDoc(testRef, {
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    
    console.log('✅ Write test passed');
    
    // Test reading from Firestore  
    const testSnap = await getDoc(testRef);
    if (testSnap.exists()) {
      console.log('✅ Read test passed');
      console.log('✅ Firebase connection is working!');
      return true;
    } else {
      console.log('❌ Read test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection;
}