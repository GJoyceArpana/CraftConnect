// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlth9W0rZzW8DfOuNbjcx3RkeHxhBgOg0",
  authDomain: "craftconnect-9813f.firebaseapp.com",
  projectId: "craftconnect-9813f",
  storageBucket: "craftconnect-9813f.firebasestorage.app",
  messagingSenderId: "544894350181",
  appId: "1:544894350181:web:3b7d2cd04d5a392d08e78c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;
