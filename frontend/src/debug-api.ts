// Debug script to test API connectivity
export async function testProductsAPI() {
  try {
    console.log('🧪 Testing Products API...');
    const response = await fetch('http://localhost:5000/api/products');
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('❌ API Error:', error);
    return null;
  }
}

// Run test on page load
if (typeof window !== 'undefined') {
  window.testProductsAPI = testProductsAPI;
  console.log('✅ Debug API available as window.testProductsAPI()');
}
