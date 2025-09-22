import React, { useState, useEffect } from 'react';
import Home from './Home';

// Buyer components
import BuyerLogin from './buyer/Login';
import BuyerOtp from './buyer/Otp';
import BuyerSetPassword from './buyer/SetPassword';
import BuyerSetupProfile from './buyer/SetupProfile';
import BuyerDashboard from './buyer/Dashboard';
import BuyerCart from './buyer/Cart';

// Seller components
import SellerLogin from './seller/Login';
import SellerOtp from './seller/Otp';
import SellerSetPassword from './seller/SetPassword';
import SellerSetupProfile from './seller/SetupProfile';
import SellerDashboard from './seller/SellerDashboard';
import CreateProduct from './seller/CreateProduct';

import './buyer.css';
import './home-hero.css';

function App() {
  const [route, setRoute] = useState('home');
  const [navigationStack, setNavigationStack] = useState(['home']);
  const [currentUser, setCurrentUser] = useState(null);
  const [tempUserData, setTempUserData] = useState({});

  // Initialize from localStorage
  useEffect(() => {
    const buyerData = localStorage.getItem('cc_buyer');
    const sellerData = localStorage.getItem('cc_seller');
    
    if (buyerData) {
      const buyer = JSON.parse(buyerData);
      if (buyer.isComplete) {
        setCurrentUser({ ...buyer, type: 'buyer' });
        setRoute('buyer-dashboard');
      }
    } else if (sellerData) {
      const seller = JSON.parse(sellerData);
      if (seller.isComplete) {
        setCurrentUser({ ...seller, type: 'seller' });
        setRoute('seller-dashboard');
      }
    }
  }, []);

  const navigateTo = (newRoute, data = {}) => {
    setNavigationStack(prev => [...prev, route]);
    setRoute(newRoute);
    if (Object.keys(data).length > 0) {
      setTempUserData(prev => ({ ...prev, ...data }));
    }
  };

  const navigateBack = () => {
    if (navigationStack.length > 1) {
      const previousRoute = navigationStack[navigationStack.length - 1];
      setNavigationStack(prev => prev.slice(0, -1));
      setRoute(previousRoute);
    }
  };

  const logout = () => {
    if (currentUser?.type === 'buyer') {
      localStorage.removeItem('cc_buyer');
    } else if (currentUser?.type === 'seller') {
      localStorage.removeItem('cc_seller');
    }
    setCurrentUser(null);
    setTempUserData({});
    setRoute('home');
    setNavigationStack(['home']);
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
  };

  const renderCurrentRoute = () => {
    switch (route) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      
      // Buyer routes
      case 'buyer-login':
        return <BuyerLogin onNavigate={navigateTo} onBack={navigateBack} />;
      case 'buyer-otp':
        return <BuyerOtp onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData} />;
      case 'buyer-setpassword':
        return <BuyerSetPassword onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData} />;
      case 'buyer-setup':
        return <BuyerSetupProfile onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData} onUpdateUser={updateUser} />;
      case 'buyer-dashboard':
        return <BuyerDashboard user={currentUser} onNavigate={navigateTo} onLogout={logout} />;
      case 'buyer-cart':
        return <BuyerCart user={currentUser} onNavigate={navigateTo} onBack={navigateBack} />;
      
      // Seller routes
      case 'seller-login':
        return <SellerLogin onNavigate={navigateTo} onBack={navigateBack} />;
      case 'seller-otp':
        return <SellerOtp onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData} />;
      case 'seller-setpassword':
        return <SellerSetPassword onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData} />;
      case 'seller-setup':
        return <SellerSetupProfile onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData} onUpdateUser={updateUser} />;
      case 'seller-dashboard':
        return <SellerDashboard user={currentUser} onNavigate={navigateTo} onLogout={logout} />;
      case 'seller-create':
        return <CreateProduct user={currentUser} onNavigate={navigateTo} onBack={navigateBack} />;
      
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      {renderCurrentRoute()}
    </div>
  );
}

export default App;