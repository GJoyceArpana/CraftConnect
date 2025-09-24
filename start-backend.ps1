# PowerShell script to start the CraftConnect backend server
Write-Host "Starting CraftConnect Backend Server..." -ForegroundColor Green

# Navigate to backend directory
Set-Location -Path "D:\CraftConnect\backend"

# Start Python Flask server
Write-Host "Backend server starting on http://127.0.0.1:5000" -ForegroundColor Cyan
python app.py

# Keep window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "Server stopped with error. Press any key to close..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}