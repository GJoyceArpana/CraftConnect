# Start Flask server in background
Write-Host "Starting Flask server..."
$job = Start-Job -ScriptBlock {
    Set-Location "D:\CraftConnect\backend"
    python app.py
}

Write-Host "Flask server started with Job ID: $($job.Id)"
Write-Host "Server should be available at: http://localhost:5000"
Write-Host "To stop the server, run: Stop-Job $($job.Id)"
Write-Host ""

# Wait a moment for server to start
Start-Sleep -Seconds 5

# Check if server is responding
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/price_model_status" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Server is running successfully!"
    Write-Host "Status response: $($response.Content)"
} catch {
    Write-Host "❌ Server may not be ready yet. Please wait a moment and test manually."
    Write-Host "Error: $($_.Exception.Message)"
}

return $job.Id