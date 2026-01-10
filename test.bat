@echo off
REM Cart & Wishlist Test Runner Script for Windows
REM Usage: test.bat [backend|frontend|all]

setlocal enabledelayedexpansion

REM Color codes for Windows (using echo with color)
REM Note: Requires Windows 10+ or use third-party color tools

echo.
echo ===============================================
echo Cart and Wishlist Test Suite
echo ===============================================
echo.

REM Get test type from argument
set TEST_TYPE=%1
if "%TEST_TYPE%"=="" set TEST_TYPE=all

REM Check for help
if /i "%TEST_TYPE%"=="help" goto :show_help
if /i "%TEST_TYPE%"=="-h" goto :show_help

REM Run tests based on type
if /i "%TEST_TYPE%"=="backend" goto :run_backend
if /i "%TEST_TYPE%"=="frontend" goto :run_frontend
if /i "%TEST_TYPE%"=="all" goto :run_all
if /i "%TEST_TYPE%"=="both" goto :run_all

echo Error: Unknown test type: %TEST_TYPE%
echo Usage: test.bat [backend^|frontend^|all]
exit /b 1

:run_all
call :run_frontend
echo.
call :run_backend
goto :end

:run_frontend
echo ===============================================
echo Running Frontend Integration Tests
echo ===============================================
echo.

REM Check if test file exists
if not exist "test-frontend-integration.js" (
    echo Error: test-frontend-integration.js not found
    echo Make sure you're running from the root directory
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo Error: frontend directory not found
    exit /b 1
)

echo Validating frontend code...
echo.

pushd frontend
node ..\test-frontend-integration.js
set FRONTEND_RESULT=%ERRORLEVEL%
popd

echo.
if %FRONTEND_RESULT% equ 0 (
    echo Frontend tests completed successfully!
) else (
    echo Frontend tests failed
)

exit /b %FRONTEND_RESULT%

:run_backend
echo ===============================================
echo Running Backend API Tests
echo ===============================================
echo.

REM Check if backend is running (simple health check)
for /f "delims=" %%i in ('powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/cart' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop; Write-Host 'OK' } catch { Write-Host 'FAIL' }" 2^>nul') do set BACKEND_CHECK=%%i

if not "!BACKEND_CHECK!"=="OK" (
    echo Error: Backend is not running on http://localhost:5000
    echo.
    echo Start the backend with: npm run backend:dev
    exit /b 1
)

echo Backend is running
echo.

REM Check if test file exists
if not exist "test-wishlist-cart.js" (
    echo Error: test-wishlist-cart.js not found
    echo Make sure you're running from the root directory
    exit /b 1
)

echo Running tests...
echo.

node test-wishlist-cart.js
set BACKEND_RESULT=%ERRORLEVEL%

echo.
if %BACKEND_RESULT% equ 0 (
    echo Backend tests completed successfully!
) else (
    echo Backend tests failed
)

exit /b %BACKEND_RESULT%

:show_help
echo Cart and Wishlist Test Runner
echo.
echo Usage: test.bat [option]
echo.
echo Options:
echo   backend     Run backend API tests (requires backend running)
echo   frontend    Run frontend integration tests
echo   all         Run all tests (default)
echo   help        Show this help message
echo.
echo Examples:
echo   test.bat                 :: Run all tests
echo   test.bat backend         :: Run only backend tests
echo   test.bat frontend        :: Run only frontend tests
echo.
echo Before running backend tests, make sure the backend is running:
echo   npm run backend:dev
echo.
exit /b 0

:end
echo.
echo Test suite completed!
exit /b 0
