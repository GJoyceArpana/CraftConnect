import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // All other vendor libraries
            return 'vendor';
          }
          
          // Group buyer components
          if (id.includes('/src/buyer/')) {
            return 'buyer-components';
          }
          
          // Group seller components
          if (id.includes('/src/seller/')) {
            return 'seller-components';
          }
          
          // Firebase services
          if (id.includes('/src/firebase/')) {
            return 'firebase-services';
          }
          
          // Components
          if (id.includes('/src/components/')) {
            return 'ui-components';
          }
        },
        // Handle large assets separately
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Configure asset handling
    assetsInlineLimit: 0, // Don't inline any assets
    // Increase chunk size warning limit to 1MB since we're now splitting properly
    chunkSizeWarningLimit: 1000
  }
});
