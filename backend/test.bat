@echo off
setlocal enabledelayedexpansion

set "baseUrl=http://localhost:5000/api"
set "email=admin@hezalthtelabel.com"
set "password=Admin@123456"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Image Upload Feature - Test Suite                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Test 1: Server Connection
echo → Server Connection
powershell -Command "(Invoke-WebRequest -Uri '%baseUrl%/products?limit=1' -UseBasicParsing -TimeoutSec 5).StatusCode" >nul 2>&1
if !ERRORLEVEL! equ 0 (
    echo   ✓ Server responding on port 5000
) else (
    echo   ✗ Server not responding
    exit /b 1
)

REM Test 2: Login
echo.
echo → Admin Login
for /f %%i in ('powershell -Command "^
`$body = @{email='%email%'; password='%password%'} | ConvertTo-Json; ^
try { ^
  `$r = Invoke-WebRequest -Uri '%baseUrl%/auth/admin-login' -Method POST -Headers @{'Content-Type'='application/json'} -Body `$body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; ^
  `$data = `$r.Content | ConvertFrom-Json; ^
  if (`$data.token) { Write-Host `$data.token } ^
} catch { ^
  Write-Host 'FAILED' ^
}" ') do set "token=%%i"

if "!token!"=="FAILED" (
    echo   ✗ Login failed
    exit /b 1
) else (
    echo   ✓ Admin login successful
)

REM Test 3: Create Product  
echo.
echo → Create Product
for /f %%i in ('powershell -Command "^
`$body = @{name=\"Test-$(Get-Random)\";price=99.99;stock=10;category=\"Electronics\";description=\"Test\"} | ConvertTo-Json; ^
try { ^
  `$r = Invoke-WebRequest -Uri '%baseUrl%/products' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'='Bearer !token!'} -Body `$body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; ^
  `$data = `$r.Content | ConvertFrom-Json; ^
  Write-Host `$data._id ^
} catch { ^
  Write-Host 'FAILED' ^
}" ') do set "productId=%%i"

if "!productId!"=="FAILED" (
    echo   ✗ Create product failed
    exit /b 1
) else (
    echo   ✓ Product created: !productId!
)

REM Test 4: Upload Images
echo.
echo → Upload Images
powershell -Command "^
`$img = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ygnKKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW1wEIAwEAPwD+yKKKKACiiigD/2Q=='; ^
`$body = @{productId='!productId!'; images=@(`$img, `$img)} | ConvertTo-Json -Depth 5; ^
try { ^
  `$r = Invoke-WebRequest -Uri '%baseUrl%/upload/product-images' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'='Bearer !token!'} -Body `$body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; ^
  `$data = `$r.Content | ConvertFrom-Json; ^
  Write-Host \"  ✓ Uploaded `$(`$data.images.Count) images\" ^
} catch { ^
  Write-Host \"  ✗ Upload failed: `$_\" ^
}
" 

REM Test 5: Verify Database
echo.
echo → Verify Database
powershell -Command "^
try { ^
  `$r = Invoke-WebRequest -Uri '%baseUrl%/products/!productId!' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; ^
  `$data = `$r.Content | ConvertFrom-Json; ^
  if (`$data.images.Count -gt 0) { ^
    Write-Host \"  ✓ Product has `$(`$data.images.Count) images\" ^
  } else { ^
    Write-Host \"  ✗ No images in database\" ^
  } ^
} catch { ^
  Write-Host \"  ✗ Verify failed: `$_\" ^
}
"

REM Test 6: Cloudinary Signature
echo.
echo → Cloudinary Signature
powershell -Command "^
try { ^
  `$r = Invoke-WebRequest -Uri '%baseUrl%/upload/cloudinary-signature' -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'='Bearer !token!'} -Body '{}' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; ^
  `$data = `$r.Content | ConvertFrom-Json; ^
  if (`$data.signature) { ^
    Write-Host \"  ✓ Signature generated\" ^
  } else { ^
    Write-Host \"  ✗ No signature\" ^
  } ^
} catch { ^
  Write-Host \"  ✗ Signature failed: `$_\" ^
}
"

REM Test 7: List Products
echo.
echo → Get Products List
powershell -Command "^
try { ^
  `$r = Invoke-WebRequest -Uri '%baseUrl%/products' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop; ^
  `$data = `$r.Content | ConvertFrom-Json; ^
  Write-Host \"  ✓ Found `$(`$data.products.Count) products\" ^
} catch { ^
  Write-Host \"  ✗ List failed: `$_\" ^
}
"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   All tests completed!                                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
