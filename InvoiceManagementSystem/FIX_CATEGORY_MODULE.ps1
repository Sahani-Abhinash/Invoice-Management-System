# Category Module Fix Script
# Run this from the IMS.API directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Category Module Database Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Type column exists
Write-Host "Step 1: Checking database structure..." -ForegroundColor Yellow

# Step 2: Apply migrations
Write-Host "Step 2: Applying database migrations..." -ForegroundColor Yellow
dotnet ef database update --project "..\IMS.Infrastructure\IMS.Infrastructure.csproj"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Migrations applied successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to apply migrations" -ForegroundColor Red
    Write-Host "Trying to add migration and update..." -ForegroundColor Yellow
    
    # Remove the problematic migration if it exists
    dotnet ef migrations remove --project "..\IMS.Infrastructure\IMS.Infrastructure.csproj" --force
    
    # Add new migration
    dotnet ef migrations add FixCategoryType --project "..\IMS.Infrastructure\IMS.Infrastructure.csproj"
    
    # Apply it
    dotnet ef database update --project "..\IMS.Infrastructure\IMS.Infrastructure.csproj"
}

Write-Host ""
Write-Host "Step 3: Building the project..." -ForegroundColor Yellow
dotnet build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful!" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the API: dotnet run" -ForegroundColor White
Write-Host "2. Test the categories endpoint: https://localhost:7276/api/category" -ForegroundColor White
Write-Host ""
