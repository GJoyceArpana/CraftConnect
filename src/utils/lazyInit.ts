// Lazy initialization for development utilities
// These services are loaded only when actually needed

let isInitialized = false;

export const initializeDevServices = async () => {
  if (isInitialized) return;
  
  try {
    // Load development utilities only when needed
    await Promise.all([
      import('../firebase/adminUtils'),
      import('../resetAccount'),
      import('../firebase/passwordReset'),
      import('../firebase/testConnection'),
      import('../firebase/test')
    ]);
    
    isInitialized = true;
    console.log('Development services initialized');
  } catch (error) {
    console.error('Failed to initialize development services:', error);
  }
};

// Initialize on first user interaction in development
if (process.env.NODE_ENV === 'development') {
  // Initialize when user first interacts with the page
  const initOnInteraction = () => {
    initializeDevServices();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
  };
  
  document.addEventListener('click', initOnInteraction);
  document.addEventListener('keydown', initOnInteraction);
}