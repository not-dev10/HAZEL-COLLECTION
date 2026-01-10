$baseUrl = "http://localhost:5000/api"
$email = "admin@hezalthtelabel.com"
$password = "Admin@123456"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   Image Upload Feature - Test Suite                        ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue

Write-Host "`n→ Server Connection" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "$baseUrl/products?limit=1" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Server responding" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Server error" -ForegroundColor Red
    exit 1
}

Write-Host "`n→ Admin Login" -ForegroundColor Cyan
try {
    $body = @{email = $email; password = $password} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$baseUrl/auth/admin-login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $data = $r.Content | ConvertFrom-Json
    if ($data.token) {
        $token = $data.token
        Write-Host "  ✓ Login successful" -ForegroundColor Green
    } else {
        throw "No token returned"
    }
} catch {
    Write-Host "  ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n→ Create Product" -ForegroundColor Cyan
try {
    $body = @{
        name = "Test-$(Get-Random)"
        price = 99.99
        stock = 10
        category = "Electronics"
        description = "Test"
    } | ConvertTo-Json
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $r = Invoke-WebRequest -Uri "$baseUrl/products" -Method POST -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $product = $r.Content | ConvertFrom-Json
    $productId = $product._id
    Write-Host "  ✓ Product created: $productId" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Create failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n→ Upload Images" -ForegroundColor Cyan
try {
    $img = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ygnKKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW1wEIAwEAPwD+yKKKKACiiigD/2Q=="
    $body = @{
        productId = $productId
        images = @($img, $img)
    } | ConvertTo-Json -Depth 5
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $r = Invoke-WebRequest -Uri "$baseUrl/upload/product-images" -Method POST -Headers $headers -Body $body -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $result = $r.Content | ConvertFrom-Json
    Write-Host "  ✓ Uploaded $($result.images.Count) images" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n→ Verify Database" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/products/$productId" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $product = $r.Content | ConvertFrom-Json
    if ($product.images -and $product.images.Count -gt 0) {
        Write-Host "  ✓ Product has $($product.images.Count) images" -ForegroundColor Green
    } else {
        Write-Host "  ✗ No images found" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Verify failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n→ Cloudinary Signature" -ForegroundColor Cyan
try {
    $headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
    $r = Invoke-WebRequest -Uri "$baseUrl/upload/cloudinary-signature" -Method POST -Headers $headers -Body '{}' -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $data = $r.Content | ConvertFrom-Json
    if ($data.signature) {
        Write-Host "  ✓ Signature generated" -ForegroundColor Green
    } else {
        Write-Host "  ✗ No signature" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ Signature failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n→ Get Products" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri "$baseUrl/products" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $data = $r.Content | ConvertFrom-Json
    Write-Host "  ✓ Found $($data.products.Count) products" -ForegroundColor Green
} catch {
    Write-Host "  ✗ List failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   Test Complete!                                           ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
