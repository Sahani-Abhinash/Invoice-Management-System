# This script creates a new EF Core migration to remove the unique constraint

# Navigate to the IMS.API directory (where DbContext is configured)
cd "D:\Projects\Invoice Management System\InvoiceManagementSystem\IMS.API"

# Create the migration
dotnet ef migrations add "RemoveItemPriceVariantUniqueConstraint" -p "..\IMS.Infrastructure\IMS.Infrastructure.csproj" -s "IMS.API.csproj" --verbose

Write-Host "Migration created successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the generated migration in IMS.Infrastructure/Migrations/" -ForegroundColor Yellow
Write-Host "2. Run: dotnet ef database update" -ForegroundColor Yellow
