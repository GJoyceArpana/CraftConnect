import React, { useState, useEffect } from 'react';
import { UserService } from '../firebase/userService';

export const ProfileDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results: string[] = [];
    const info: any = {};

    try {
      // Check localStorage data
      const buyerData = localStorage.getItem('cc_buyer');
      const sellerData = localStorage.getItem('cc_seller');
      const userData = localStorage.getItem('cc_user');
      
      info.localStorage = {
        buyer: buyerData ? JSON.parse(buyerData) : null,
        seller: sellerData ? JSON.parse(sellerData) : null,
        user: userData ? JSON.parse(userData) : null
      };
      results.push(`✅ localStorage check completed`);

      // Test Firebase connection
      try {
        const testUser = await UserService.getBuyer('test-phone');
        results.push(`✅ Firebase connection working`);
        info.firebase = 'Connected';
      } catch (error) {
        results.push(`❌ Firebase error: ${error}`);
        info.firebase = `Error: ${error}`;
      }

      // Check current URL and route state
      info.currentUrl = window.location.href;
      results.push(`✅ Current URL: ${info.currentUrl}`);

    } catch (error) {
      results.push(`❌ Diagnostic error: ${error}`);
    }

    setDebugInfo(info);
    setTestResults(results);
  };

  const testLogin = async (userType: 'buyer' | 'seller') => {
    try {
      const testPhone = '1234567890';
      const testPassword = 'test123';
      
      // Try to create test user
      if (userType === 'buyer') {
        await UserService.createBuyer({
          phone: testPhone,
          password: testPassword,
          name: 'Test Buyer',
          isComplete: true
        });
      } else {
        await UserService.createSeller({
          phone: testPhone,
          password: testPassword,
          businessName: 'Test Business',
          ownerName: 'Test Owner',
          isComplete: true
        });
      }
      
      setTestResults(prev => [...prev, `✅ ${userType} test user created`]);
      
      // Try to verify login
      const user = await UserService.verifyLogin(testPhone, testPassword, userType);
      if (user) {
        setTestResults(prev => [...prev, `✅ ${userType} login verification successful`]);
        
        // Store in localStorage like the app does
        localStorage.setItem(`cc_${userType}`, JSON.stringify(user));
        setTestResults(prev => [...prev, `✅ ${userType} stored in localStorage`]);
        
        // Refresh diagnostics
        runDiagnostics();
      } else {
        setTestResults(prev => [...prev, `❌ ${userType} login verification failed`]);
      }
      
    } catch (error) {
      setTestResults(prev => [...prev, `❌ ${userType} test failed: ${error}`);
    }
  };

  const clearData = () => {
    localStorage.removeItem('cc_buyer');
    localStorage.removeItem('cc_seller');
    localStorage.removeItem('cc_user');
    setTestResults(prev => [...prev, `🗑️ Cleared all localStorage data`]);
    runDiagnostics();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🔧 Profile Debug Dashboard</h2>
      
      {/* Test Results */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Results</h3>
        <div className="bg-gray-100 rounded-lg p-4 max-h-60 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="font-mono text-sm mb-1">
              {result}
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Debug Information</h3>
        <pre className="bg-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-60">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => testLogin('buyer')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Test Buyer Login
        </button>
        
        <button
          onClick={() => testLogin('seller')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Test Seller Login
        </button>
        
        <button
          onClick={runDiagnostics}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Re-run Diagnostics
        </button>
        
        <button
          onClick={clearData}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Clear All Data
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Refresh Page
        </button>
      </div>

      {/* Quick Navigation Links */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold mb-2">Quick Navigation Test</h4>
        <div className="flex flex-wrap gap-2">
          <a href="/" className="text-blue-600 hover:underline">Home</a>
          <a href="/#buyer-login" className="text-blue-600 hover:underline">Buyer Login</a>
          <a href="/#seller-login" className="text-blue-600 hover:underline">Seller Login</a>
          <a href="/#buyer-dashboard" className="text-blue-600 hover:underline">Buyer Dashboard</a>
          <a href="/#seller-dashboard" className="text-blue-600 hover:underline">Seller Dashboard</a>
        </div>
      </div>
    </div>
  );
};