// Debug script to test image URLs
export async function testImageURLs() {
  try {
    console.log('🧪 Testing Image URLs...');
    
    const response = await fetch('http://localhost:5000/api/products');
    const data = await response.json();
    
    if (data.success && data.products) {
      console.log(`📊 Found ${data.products.length} products`);
      
      for (const product of data.products) {
        console.log(`\n📦 ${product.name}`);
        console.log(`   Image URL: ${product.image}`);
        
        // Test if image is accessible
        try {
          const imgResponse = await fetch(product.image, { method: 'HEAD' });
          console.log(`   Status: ${imgResponse.status} ${imgResponse.ok ? '✅' : '❌'}`);
        } catch (error) {
          console.log(`   Error: ${error.message} ❌`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).testImageURLs = testImageURLs;
  console.log('✅ Image debug available as window.testImageURLs()');
}
