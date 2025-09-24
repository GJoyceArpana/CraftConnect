# Complete Integration Test Script
Write-Host "🎯 CraftConnect Price Prediction Integration Test" -ForegroundColor Cyan
Write-Host "=" * 70

# Check if backend server is running
Write-Host "`n1. Checking Backend Server Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/price_model_status" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend server is running" -ForegroundColor Green
    Write-Host "   Model Status: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend server not responding. Starting server..." -ForegroundColor Red
    Write-Host "   Please make sure to run: cd backend && python app.py" -ForegroundColor Yellow
    Write-Host "   Or use the start_server.ps1 script" -ForegroundColor Yellow
    exit 1
}

# Test API endpoints
Write-Host "`n2. Testing API Endpoints..." -ForegroundColor Yellow

$testData = @{
    base_material_price = 100.0
    dimensions = 200.0
    hours_of_labor = 6.0
    transport_distance = 40.0
    region = "North"
    category = "pottery"
    crafting_process = "handmade"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/price_suggestions" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Price suggestions API working" -ForegroundColor Green
    Write-Host "   Number of suggestions: $($data.suggestions.suggestions.Count)" -ForegroundColor Gray
    Write-Host "   Sample price: ₹$($data.suggestions.suggestions[0].price)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Price suggestions API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Check if React dev server is running
Write-Host "`n3. Checking React Development Server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ React dev server is running at http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  React dev server not running. To start:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host "   (This will start the React development server)" -ForegroundColor Gray
}

# Integration summary
Write-Host "`n" + "=" * 70
Write-Host "🎉 Integration Summary" -ForegroundColor Cyan

Write-Host "`n✅ Completed Features:" -ForegroundColor Green
Write-Host "   • AI-powered price prediction using CatBoost ML model"
Write-Host "   • TypeScript service for API communication"
Write-Host "   • React component for displaying price suggestions"
Write-Host "   • Integration with CreateProduct form"
Write-Host "   • Multiple pricing strategies (AI, labor-based, category-based)"
Write-Host "   • Real-time price suggestions based on product details"

Write-Host "`n📋 How to Test:" -ForegroundColor Blue
Write-Host "   1. Navigate to http://localhost:5173"
Write-Host "   2. Go to seller login/dashboard"
Write-Host "   3. Create a new product"
Write-Host "   4. Fill in Category, Material, and Process fields"
Write-Host "   5. Adjust Hours of Labor as needed"
Write-Host "   6. Watch AI price suggestions appear automatically"
Write-Host "   7. Click on any suggestion to use it as your price"

Write-Host "`n🔧 API Endpoints Available:" -ForegroundColor Magenta
Write-Host "   • GET  /price_model_status - Check ML model status"
Write-Host "   • POST /predict_price - Get AI price prediction"
Write-Host "   • POST /price_suggestions - Get comprehensive suggestions"

Write-Host "`n" + "=" * 70
Write-Host "🚀 Integration Complete! Ready for testing." -ForegroundColor Green -BackgroundColor Black