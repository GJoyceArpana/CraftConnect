# Test Price Prediction API Endpoints
Write-Host "🧪 Testing Price Prediction API Endpoints" -ForegroundColor Cyan
Write-Host "=" * 60

# Test data
$testData = @{
    base_material_price = 75.0
    dimensions = 150.0
    hours_of_labor = 8.0
    transport_distance = 30.0
    region = "South"
    category = "textiles"
    crafting_process = "woven"
} | ConvertTo-Json

Write-Host "`n1. Testing Model Status Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/price_model_status" -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Price Prediction Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/predict_price" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing Price Suggestions Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/price_suggestions" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + "=" * 60
Write-Host "✅ API Endpoint Testing Complete!" -ForegroundColor Green