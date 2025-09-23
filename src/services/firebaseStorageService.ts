import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface ImageUploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
}

class FirebaseStorageService {
  // Upload image to Firebase Storage
  async uploadImage(file: File, path: string): Promise<ImageUploadResult> {
    try {
      // Validate file
      if (!file) {
        return { success: false, error: 'No file provided' };
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return { success: false, error: 'File size exceeds 5MB limit' };
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' };
      }

      // Create a unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}_${randomStr}_${file.name}`;
      const fullPath = `${path}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, fullPath);

      // Upload file
      console.log('Uploading file to:', fullPath);
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('File uploaded successfully. Download URL:', downloadURL);
      return { success: true, downloadURL };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Upload product image
  async uploadProductImage(file: File, productId: string, sellerId: string): Promise<ImageUploadResult> {
    const path = `products/${sellerId}/${productId}`;
    return this.uploadImage(file, path);
  }

  // Upload user profile image
  async uploadProfileImage(file: File, userId: string, userType: 'buyer' | 'seller'): Promise<ImageUploadResult> {
    const path = `profiles/${userType}/${userId}`;
    return this.uploadImage(file, path);
  }

  // Delete image from Firebase Storage
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract the storage path from the URL
      const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
      
      if (!imageUrl.startsWith(baseUrl)) {
        console.error('Invalid Firebase Storage URL');
        return false;
      }

      // Extract the path
      const encodedPath = imageUrl.substring(baseUrl.length).split('?')[0];
      const path = decodeURIComponent(encodedPath);
      
      // Create reference and delete
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      console.log('Image deleted successfully from:', path);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Convert base64 data URL to File object
  dataURLToFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  // Get file extension from MIME type
  getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return extensions[mimeType] || 'jpg';
  }

  // Upload base64 image (for backward compatibility)
  async uploadBase64Image(
    base64Data: string, 
    path: string, 
    filename: string = 'image'
  ): Promise<ImageUploadResult> {
    try {
      const file = this.dataURLToFile(base64Data, filename);
      return this.uploadImage(file, path);
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      return { 
        success: false, 
        error: 'Failed to process base64 image data'
      };
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
export default FirebaseStorageService;