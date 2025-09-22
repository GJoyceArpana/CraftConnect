import React from 'react';

const Home = ({ onNavigate }) => {
  return (
    <div className="hero-bg min-h-screen flex flex-col items-center justify-center px-4 jute-pattern">
      {/* Floating decoration cards */}
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

      <div className="text-center max-w-4xl mx-auto z-10">
        <h1 className="brand-title mb-6">
          CraftConnect
        </h1>
        
        <p className="text-xl md:text-2xl text-[#333] mb-4 font-light leading-relaxed">
          Connecting artisans with conscious buyers
        </p>
        
        <p className="text-lg text-[#666] mb-12 max-w-2xl mx-auto leading-relaxed">
          Discover authentic handcrafted products while supporting sustainability. 
          Every purchase helps reduce carbon footprint and empowers traditional artisans.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button 
            className="hero-button w-full sm:w-auto"
            onClick={() => onNavigate('buyer-login')}
          >
            <span className="relative z-10">🛒 Start Buying</span>
          </button>
          
          <button 
            className="hero-button secondary w-full sm:w-auto"
            onClick={() => onNavigate('seller-login')}
          >
            <span className="relative z-10">🎨 Start Selling</span>
          </button>
        </div>

        {/* Stats preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#154731] mb-2">2.5k+</div>
            <div className="text-sm text-[#666]">CO₂ Saved (kg)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d67a4a] mb-2">150+</div>
            <div className="text-sm text-[#666]">Artisans</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#d6b24a] mb-2">800+</div>
            <div className="text-sm text-[#666]">Happy Buyers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;