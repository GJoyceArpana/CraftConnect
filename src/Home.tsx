// src/Home.tsx
import type { FC } from 'react';
import './home-hero.css';

import img1 from './assets/images/img1.jpg';
import img2 from './assets/images/img2.jpg';
import img3 from './assets/images/img3.jpg';
import img4 from './assets/images/img4.jpg';
import img5 from './assets/images/img5.jpg';

type HomeProps = {
  onNavigate: (path: string) => void;
};

const Home: FC<HomeProps> = ({ onNavigate }) => {
  const images = [img1, img2, img3, img4, img5];

  return (
    <div className="hero-bg min-h-screen flex flex-col items-center justify-center px-4 jute-pattern">
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
            {images.concat(images).map((src, idx) => (
              <div className="image-card" key={idx}>
                <img src={src} alt={`craft-${idx}`} loading="lazy" />
              </div>
            ))}
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
        </div>
      </div>
    </div>
  );
};

export default Home;
