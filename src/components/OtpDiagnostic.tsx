import React, { useState } from 'react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

const OtpDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testPhone] = useState('9876543210'); // Test phone number

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Backend connectivity
    addResult({ test: 'Backend Connectivity', status: 'pending', message: 'Testing...' });
    try {
      const response = await fetch('http://127.0.0.1:5000/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (response.ok && data.message) {
        addResult({ 
          test: 'Backend Connectivity', 
          status: 'success', 
          message: `✅ Backend is running: ${data.message}`,
          details: data
        });
      } else {
        addResult({ 
          test: 'Backend Connectivity', 
          status: 'error', 
          message: `❌ Backend responded but with error: ${response.status}`,
          details: data
        });
      }
    } catch (error) {
      addResult({ 
        test: 'Backend Connectivity', 
        status: 'error', 
        message: `❌ Cannot connect to backend: ${error}`,
        details: error
      });
    }

    // Test 2: Send OTP
    addResult({ test: 'Send OTP', status: 'pending', message: 'Testing...' });
    try {
      const response = await fetch('http://127.0.0.1:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone })
      });
      const data = await response.json();
      
      if (data.success) {
        addResult({ 
          test: 'Send OTP', 
          status: 'success', 
          message: `✅ OTP sent successfully! ${data.dev_mode ? 'Dev OTP: ' + data.dev_otp : ''}`,
          details: data
        });

        // Test 3: Verify OTP (only if send was successful and we have dev_otp)
        if (data.dev_otp) {
          addResult({ test: 'Verify OTP', status: 'pending', message: 'Testing with dev OTP...' });
          
          try {
            const verifyResponse = await fetch('http://127.0.0.1:5000/verify-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: testPhone, otp: data.dev_otp })
            });
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              addResult({ 
                test: 'Verify OTP', 
                status: 'success', 
                message: `✅ OTP verification successful!`,
                details: verifyData
              });
            } else {
              addResult({ 
                test: 'Verify OTP', 
                status: 'error', 
                message: `❌ OTP verification failed: ${verifyData.error}`,
                details: verifyData
              });
            }
          } catch (error) {
            addResult({ 
              test: 'Verify OTP', 
              status: 'error', 
              message: `❌ Verify OTP network error: ${error}`,
              details: error
            });
          }
        }
      } else {
        addResult({ 
          test: 'Send OTP', 
          status: 'error', 
          message: `❌ Send OTP failed: ${data.error || 'Unknown error'}`,
          details: data
        });
      }
    } catch (error) {
      addResult({ 
        test: 'Send OTP', 
        status: 'error', 
        message: `❌ Send OTP network error: ${error}`,
        details: error
      });
    }

    // Test 4: Browser environment
    addResult({ 
      test: 'Browser Environment', 
      status: 'success', 
      message: `✅ Browser: ${navigator.userAgent}`,
      details: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });

    setIsRunning(false);
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white shadow-lg border border-gray-300 rounded-lg p-4 z-50 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔧 OTP Diagnostics</h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {results.map((result, index) => (
          <div key={index} className="border-l-4 pl-3 py-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{result.test}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                result.status === 'success' ? 'bg-green-100 text-green-800' :
                result.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {result.status}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{result.message}</p>
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-blue-600">View Details</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-32">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && !isRunning && (
        <p className="text-gray-500 text-sm text-center py-4">
          Click "Run Tests" to diagnose OTP issues
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Check browser console (F12) for detailed logs</li>
          <li>Ensure backend server is running on port 5000</li>
          <li>In dev mode, OTP is shown in the alert dialog</li>
          <li>Test phone: {testPhone}</li>
        </ul>
      </div>
    </div>
  );
};

export default OtpDiagnostic;