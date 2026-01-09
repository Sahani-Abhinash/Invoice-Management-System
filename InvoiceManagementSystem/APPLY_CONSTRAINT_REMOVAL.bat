@echo off
REM This script applies the unique constraint removal migration and restarts the services

setlocal enabledelayedexpansion

cd /d "D:\Projects\Invoice Management System\InvoiceManagementSystem"

echo.
echo ========================================
echo ItemPriceVariant Update Process
echo ========================================
echo.

REM Step 1: Apply Migration
echo [1/4] Applying database migration...
echo.
cd IMS.API
dotnet ef database update
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo [OK] Migration applied successfully!
echo.

REM Step 2: Rebuild Backend
echo [2/4] Rebuilding backend...
dotnet build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo [OK] Backend built successfully!
echo.

REM Step 3: Rebuild Frontend
echo [3/4] Rebuilding frontend...
cd ..\ims.ClientApp
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo [OK] Frontend built successfully!
echo.

REM Step 4: Done
echo [4/4] Complete!
echo.
echo ========================================
echo Changes Applied Successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Restart the IMS.API service
echo 2. Start the Angular dev server: npm start
echo 3. Test editing variants in the UI
echo.
pause
