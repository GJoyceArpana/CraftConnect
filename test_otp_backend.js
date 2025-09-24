// Simple test script to verify OTP backend functionality
// Run with: node test_otp_backend.js

const testPhone = '9876543210';
const baseUrl = 'http://127.0.0.1:5000';

async function testOtpFlow() {
    console.log('🧪 Testing OTP Backend Flow\n');
    
    try {
        // Test 1: Send OTP
        console.log('📤 Step 1: Sending OTP...');
        const sendResponse = await fetch(`${baseUrl}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: testPhone }),
        });
        
        const sendData = await sendResponse.json();
        console.log('Response:', sendData);
        
        if (!sendData.success) {
            console.error('❌ Failed to send OTP:', sendData.error);
            return;
        }
        
        console.log('✅ OTP sent successfully!');
        
        if (sendData.dev_otp) {
            console.log(`🔧 Dev OTP: ${sendData.dev_otp}`);
            
            // Test 2: Verify OTP
            console.log('\n📥 Step 2: Verifying OTP...');
            const verifyResponse = await fetch(`${baseUrl}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    phone: testPhone, 
                    otp: sendData.dev_otp 
                }),
            });
            
            const verifyData = await verifyResponse.json();
            console.log('Response:', verifyData);
            
            if (verifyData.success) {
                console.log('✅ OTP verified successfully!');
                console.log('\n🎉 All tests passed! OTP backend is working correctly.');
            } else {
                console.error('❌ OTP verification failed:', verifyData.error);
            }
        } else {
            console.log('⚠️  No dev_otp provided, skipping verification test');
            console.log('   This might be production mode or Twilio is configured');
        }
        
    } catch (error) {
        console.error('💥 Network error:', error.message);
        console.log('\n🔍 Troubleshooting:');
        console.log('   1. Make sure the Flask backend is running: python backend/app.py');
        console.log('   2. Check if port 5000 is available');
        console.log('   3. Verify the backend URL is correct');
    }
}

// Test 3: Backend health check
async function testBackendHealth() {
    console.log('\n🏥 Testing Backend Health...');
    try {
        const response = await fetch(`${baseUrl}/`);
        const data = await response.json();
        console.log('✅ Backend is healthy:', data.message);
    } catch (error) {
        console.error('❌ Backend health check failed:', error.message);
    }
}

async function runAllTests() {
    await testBackendHealth();
    await testOtpFlow();
}

runAllTests();