#!/usr/bin/env powershell
param([string]$Email = "admin@hezalthtelabel.com", [string]$Password = "Admin@123456")

$baseUrl = "http://localhost:5000/api"
$token = ""
$passed = 0
$failed = 0

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   Image Upload Feature - Test Suite                        ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue

# Test 1: Server
Write-Host "`n→ Server Connection" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/products?limit=1" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✓ Server responding" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Server error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "`n→ Admin Login" -ForegroundColor Cyan
try {
    $body = @{email = $Email; password = $Password} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$baseUrl/auth/admin-login" -Method POST -Headers @{'Content-Type'='application/json'} -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $data = $r.Content | ConvertFrom-Json
    if ($data.token) {
        $token = $data.token
        Write-Host "  ✓ Login successful" -ForegroundColor Green
        $passed++
    } else {
        throw "No token"
    }
} catch {
    Write-Host "  ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
    exit 1
}

# Test 3: Create Product
Write-Host "`n→ Create Product" -ForegroundColor Cyan
try {
    $body = @{
        name = "Test-$(Get-Random)"
        price = 99.99
        stock = 10
        category = 'Electronics'
        description = 'Test'
    } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$baseUrl/products" -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $product = $r.Content | ConvertFrom-Json
    $productId = $product._id
    Write-Host "  ✓ Product created: $productId" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Create failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
    exit 1
}

# Test 4: Upload Images
Write-Host "`n→ Upload Images" -ForegroundColor Cyan
try {
    $img = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ygnKKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW1wEIAwEAPwD+yKKKKACiiigD/2Q=='
    $body = @{
        productId = $productId
        images = @($img, $img)
    } | ConvertTo-Json -Depth 5
    $r = Invoke-WebRequest -Uri "$baseUrl/upload/product-images" -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $result = $r.Content | ConvertFrom-Json
    Write-Host "  ✓ Uploaded $($result.images.Count) images" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Verify Database
Write-Host "`n→ Verify Database" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/products/$productId" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $product = $r.Content | ConvertFrom-Json
    if ($product.images.Count -gt 0) {
        Write-Host "  ✓ Product has $($product.images.Count) images" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ✗ No images in DB" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ✗ Verify failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Cloudinary Signature
Write-Host "`n→ Cloudinary Signature" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/upload/cloudinary-signature" -Method POST -Headers @{'Content-Type'='application/json'; 'Authorization'="Bearer $token"} -Body '{}' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $data = $r.Content | ConvertFrom-Json
    if ($data.signature) {
        Write-Host "  ✓ Signature generated" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ✗ No signature" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ✗ Signature failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 7: List Products
Write-Host "`n→ Get Products" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/products" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $data = $r.Content | ConvertFrom-Json
    Write-Host "  ✓ Found $($data.products.Count) products" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  ✗ List failed: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   Summary                                                    ║" -ForegroundColor Blue
Write-Host "╠════════════════════════════════════════════════════════════╣" -ForegroundColor Blue
Write-Host "  ✓ Passed: $passed" -ForegroundColor Green
Write-Host "  ✗ Failed: $failed" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
