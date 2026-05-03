# PowerShell script to download ngrok safely
# Run this as Administrator

Write-Host "🚀 Downloading ngrok for AI Voice Booking Assistant" -ForegroundColor Green
Write-Host "=" * 60

# Create ngrok directory
$ngrokDir = "C:\ngrok"
if (!(Test-Path $ngrokDir)) {
    New-Item -ItemType Directory -Path $ngrokDir -Force
    Write-Host "✅ Created directory: $ngrokDir" -ForegroundColor Green
}

# Download ngrok
$downloadUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$zipFile = "$ngrokDir\ngrok.zip"

Write-Host "📥 Downloading ngrok..." -ForegroundColor Yellow
try {
    # Download with progress
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "✅ Download completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try downloading manually from: $downloadUrl" -ForegroundColor Yellow
    exit 1
}

# Extract ngrok
Write-Host "📦 Extracting ngrok..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $zipFile -DestinationPath $ngrokDir -Force
    Remove-Item $zipFile -Force
    Write-Host "✅ Extraction completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test ngrok
Write-Host "🧪 Testing ngrok..." -ForegroundColor Yellow
try {
    $ngrokPath = "$ngrokDir\ngrok.exe"
    $version = & $ngrokPath version
    Write-Host "✅ ngrok is working: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 You may need to add $ngrokDir to your PATH" -ForegroundColor Yellow
}

# Add to PATH (optional)
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$ngrokDir*") {
    Write-Host "🔧 Adding ngrok to PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$ngrokDir", "User")
    Write-Host "✅ Added to PATH" -ForegroundColor Green
    Write-Host "💡 Restart Command Prompt for PATH changes to take effect" -ForegroundColor Yellow
}

Write-Host "`n🎉 ngrok setup completed!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Get auth token from: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
Write-Host "2. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
Write-Host "3. Run: ngrok http 7001" -ForegroundColor White
Write-Host "4. Copy the HTTPS URL and update WEBHOOK_BASE_URL in .env" -ForegroundColor White

Write-Host "`n🛡️ If Microsoft Defender still blocks ngrok:" -ForegroundColor Yellow
Write-Host "1. Open Windows Security" -ForegroundColor White
Write-Host "2. Go to Virus & threat protection" -ForegroundColor White
Write-Host "3. Add exclusion for folder: $ngrokDir" -ForegroundColor White
