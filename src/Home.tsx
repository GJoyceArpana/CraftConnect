// src/Home.tsx
import type { FC } from 'react';
import { useState, useEffect } from 'react';

import './home-hero.css';

// Lazy load images to reduce initial bundle size
const imageModules = {
  img1: () => import('./assets/images/img1.jpg'),
  img2: () => import('./assets/images/img2.jpg'),
  img3: () => import('./assets/images/img3.jpg'),
  img4: () => import('./assets/images/img4.jpg'),
  img5: () => import('./assets/images/img5.jpg'),
};

type HomeProps = {
  onNavigate: (path: string) => void;
};

const Home: FC<HomeProps> = ({ onNavigate }) => {
  const [images, setImages] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Load images lazily after component mounts
    const loadImages = async () => {
      try {
        const imagePromises = Object.values(imageModules).map(loader => loader());
        const loadedImages = await Promise.all(imagePromises);
        setImages(loadedImages.map(img => img.default));
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    // Delay image loading to prioritize initial render
    const timer = setTimeout(loadImages, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="hero-bg min-h-screen flex flex-col items-center justify-center px-4 jute-pattern">
      {/* OTP Diagnostic Tool - Only in development */}
      {/* Floating decoration cards (kept from your original design) */}
      <div className="floating-card top-20 left-10 bg-white/10 backdrop-blur-sm rounded-lg p-4 hidden lg:block">
        <div className="text-2xl">🌱</div>
        <div className="text-xs text-[#154731] font-medium">Eco-Friendly</div>
      </div>

      <div className="floating-card top-32 right-16 bg-white/10 backdrop-blur-sm rounded-lg p-4 hidden lg:block">
        <div className="text-2xl">🏺</div>
        <div className="text-xs text-[#d67a4a] font-medium">Handcrafted</div>
      </div>

      <div className="floating-card bottom-32 left-20 bg-white/10 backdrop-blur-sm rounded-lg p-4 hidden lg:block">
        <div className="text-2xl">♻️</div>
        <div className="text-xs text-[#154731] font-medium">Sustainable</div>
      </div>

      {/* Main hero content */}
      <div className="text-center max-w-4xl mx-auto z-10">
        <h1 className="brand-title mb-3">CraftConnect</h1>

        <p className="text-lg md:text-xl text-[#333] mb-8 font-light">
          Handmade • Transparent CO₂ • Direct pay to makers
        </p>

        {/* Image marquee: duplicate images for seamless loop */}
        <div className="image-marquee-wrapper mb-8" aria-hidden>
          <div className="image-track">
            {imagesLoaded ? (
              images.concat(images).map((src, idx) => (
                <div className="image-card" key={idx}>
                  <img src={src} alt={`craft-${idx}`} loading="lazy" />
                </div>
              ))
            ) : (
              // Placeholder while images load
              Array.from({ length: 10 }).map((_, idx) => (
                <div className="image-card" key={idx}>
                  <div className="bg-gray-200 animate-pulse w-full h-full rounded"></div>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="text-lg text-[#666] mb-12 max-w-2xl mx-auto leading-relaxed">
          CraftConnect is a curated marketplace connecting eco-conscious buyers
          with Indian artisans — see product CO₂ impact and pay makers directly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="hero-button w-full sm:w-auto" onClick={() => onNavigate('products')}>
            <span className="relative z-10">🌿 View Products & Eco Impact</span>
          </button>

          <button className="hero-button w-full sm:w-auto" onClick={() => onNavigate('buyer-login')}>
            <span className="relative z-10">🛒 Start Buying</span>
          </button>

          <button className="hero-button secondary w-full sm:w-auto" onClick={() => onNavigate('seller-login')}>
            <span className="relative z-10">🎨 Start Selling</span>
          </button>

          <button className="hero-button outline w-full sm:w-auto" onClick={() => onNavigate('about-us')}>
            <span className="relative z-10">ℹ️ About Us</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
