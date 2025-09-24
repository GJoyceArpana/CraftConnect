// src/App.tsx
import { useState, useEffect } from 'react';
import Home from './Home';
import { UserService } from './firebase/mockService';
import './firebase/adminUtils'; // Make AdminUtils available in console
import './resetAccount'; // Make reset function available
import './firebase/passwordReset'; // Make PasswordResetService available
import './firebase/testConnection'; // Make Firebase test available

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
import { Products } from './components/Products';

import './buyer.css';
import './home-hero.css';

/* ----- Temp data types ----- */
type BuyerTempData = {
  phone: string;
  isSignUp: boolean;
  password?: string;
  [k: string]: any;
};

type SellerTempData = {
  phone: string;
  isSignUp: boolean;
  password?: string;
  [k: string]: any;
};

/* Use Partial so we can safely start with {} and later merge fields */
type TempUserData = Partial<BuyerTempData & SellerTempData>;

/* Current user loose type (your app stores different shapes) */
type AnyUser = Record<string, any> | null;

function App() {
  const [route, setRoute] = useState<string>('home');
  // prefixed with underscore because this variable was never directly read (only the setter used)
  const [_navigationStack, setNavigationStack] = useState<string[]>(['home']);
  const [currentUser, setCurrentUser] = useState<AnyUser>(null);

  // tempUserData starts empty and later becomes BuyerTempData or SellerTempData (partially)
  const [tempUserData, setTempUserData] = useState<TempUserData>({});

  // Initialize from localStorage/Firebase on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // First check localStorage for quick initialization
        const buyerDataRaw = localStorage.getItem('cc_buyer');
        const sellerDataRaw = localStorage.getItem('cc_seller');

        if (buyerDataRaw) {
          const buyer = JSON.parse(buyerDataRaw);
          if (buyer?.isComplete) {
            setCurrentUser({ ...buyer, type: 'buyer' });
            setRoute('buyer-dashboard');
            setNavigationStack(['buyer-dashboard']);
            return;
          }
        }

        if (sellerDataRaw) {
          const seller = JSON.parse(sellerDataRaw);
          if (seller?.isComplete) {
            setCurrentUser({ ...seller, type: 'seller' });
            setRoute('seller-dashboard');
            setNavigationStack(['seller-dashboard']);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to initialize user from localStorage', err);
      }
    };

    initializeUser();
  }, []);

  /**
   * Central navigation helper.
   * newRoute: string route name
   * data: optional payload (temp user data etc.)
   */
  const navigateTo = (newRoute: string, data: Partial<BuyerTempData | SellerTempData> = {}) => {
    // push current route to stack
    setNavigationStack((prev: string[]) => [...prev, route]);

    // merge incoming temp data (works because tempUserData is Partial<>)
    if (data && Object.keys(data).length > 0) {
      setTempUserData((prev) => ({ ...prev, ...(data as Record<string, any>) }));
    }

    // Ensure currentUser is set when going to dashboards
    if (newRoute === 'buyer-dashboard') {
      try {
        const combinedTemp = { ...(tempUserData as Record<string, any>), ...(data as Record<string, any>) };
        if (combinedTemp?.isComplete) {
          setCurrentUser({ ...combinedTemp, type: 'buyer' });
        } else {
          const buyerRaw = localStorage.getItem('cc_buyer');
          if (buyerRaw) {
            const buyer = JSON.parse(buyerRaw);
            setCurrentUser({ ...buyer, type: 'buyer' });
          }
        }
      } catch (err) {
        console.error('Error while resolving buyer user for dashboard', err);
      }
    } else if (newRoute === 'seller-dashboard') {
      try {
        const combinedTemp = { ...(tempUserData as Record<string, any>), ...(data as Record<string, any>) };
        if (combinedTemp?.isComplete) {
          setCurrentUser({ ...combinedTemp, type: 'seller' });
        } else {
          const sellerRaw = localStorage.getItem('cc_seller');
          if (sellerRaw) {
            const seller = JSON.parse(sellerRaw);
            setCurrentUser({ ...seller, type: 'seller' });
          }
        }
      } catch (err) {
        console.error('Error while resolving seller user for dashboard', err);
      }
    }

    setRoute(newRoute);
  };

  const navigateBack = () => {
    setNavigationStack((prev: string[]) => {
      const updated = [...prev];
      const previousRoute = updated.pop() ?? 'home';
      // update route to previousRoute
      setRoute(previousRoute);
      // ensure stack isn't left empty
      return updated.length ? updated : ['home'];
    });
  };

  const logout = () => {
    try {
      if (currentUser?.type === 'buyer') {
        localStorage.removeItem('cc_buyer');
      } else if (currentUser?.type === 'seller') {
        localStorage.removeItem('cc_seller');
      }
    } catch (err) {
      console.error('Error removing user on logout', err);
    }

    setCurrentUser(null);
    setTempUserData({});
    setRoute('home');
    setNavigationStack(['home']);
  };

  const updateUser = (userData: AnyUser) => {
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
        // cast because tempUserData is Partial — component expects required fields when used
        return <BuyerOtp onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData as BuyerTempData} />;
      case 'buyer-setpassword':
        return <BuyerSetPassword onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData as BuyerTempData} />;
      case 'buyer-setup':
        return <BuyerSetupProfile onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData as BuyerTempData} onUpdateUser={updateUser} />;
      case 'buyer-dashboard':
        return <BuyerDashboard user={currentUser} onNavigate={navigateTo} onLogout={logout} />;
      case 'buyer-cart':
        return <BuyerCart user={currentUser} onNavigate={navigateTo} onBack={navigateBack} />;

      // Seller routes
      case 'seller-login':
        return <SellerLogin onNavigate={navigateTo} onBack={navigateBack} />;
      case 'seller-otp':
        return <SellerOtp onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData as SellerTempData} />;
      case 'seller-setpassword':
        return <SellerSetPassword onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData as SellerTempData} />;
      case 'seller-setup':
        return <SellerSetupProfile onNavigate={navigateTo} onBack={navigateBack} tempData={tempUserData as SellerTempData} onUpdateUser={updateUser} />;
      case 'seller-dashboard':
        return <SellerDashboard user={currentUser} onNavigate={navigateTo} onLogout={logout} />;
      case 'seller-create':
        return <CreateProduct user={currentUser} onNavigate={navigateTo} onBack={navigateBack} />;
      case 'products':
        return <Products onNavigate={navigateTo} />;

      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return <div className="min-h-screen bg-[#fdfaf6]">{renderCurrentRoute()}</div>;
}

export default App;
