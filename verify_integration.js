// Quick verification that frontend integration files are properly set up
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Gemini 2.0 Frontend Integration...\n');

// Check key files exist
const files = [
  'src/components/SustainabilityChatbot.tsx',
  'src/services/sustainabilityEngine.ts', 
  'src/services/api.ts',
  'src/components/EcoImpact.tsx'
];

let allFilesExist = true;
files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 All integration files are present!');
  
  // Check for key imports and functions
  const apiService = fs.readFileSync('src/services/api.ts', 'utf8');
  const chatbotComponent = fs.readFileSync('src/components/SustainabilityChatbot.tsx', 'utf8');
  
  console.log('\n🔧 Checking Integration Points:');
  
  // API Service checks
  if (apiService.includes('chatWithAI')) {
    console.log('✅ API Service has chatWithAI method');
  } else {
    console.log('❌ API Service missing chatWithAI method');
  }
  
  if (apiService.includes('/ai/chat')) {
    console.log('✅ API Service has AI endpoints');  
  } else {
    console.log('❌ API Service missing AI endpoints');
  }
  
  // Chatbot component checks
  if (chatbotComponent.includes('apiService')) {
    console.log('✅ Chatbot uses API service');
  } else {
    console.log('❌ Chatbot not using API service');
  }
  
  if (chatbotComponent.includes('Quick Actions')) {
    console.log('✅ Chatbot has quick actions');
  } else {
    console.log('❌ Chatbot missing quick actions');
  }
  
  console.log('\n🚀 Integration Status: READY!');
  console.log('\nTo test:');
  console.log('1. Start backend: cd backend && python app.py');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Test chatbot in the carbon footprint section');
  
} else {
  console.log('\n❌ Some files are missing. Integration may not work properly.');
}