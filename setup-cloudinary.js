#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎨 Hezal Couture - Cloudinary Setup Assistant');
console.log('============================================\n');

console.log('This script will help you configure Cloudinary for your project.');
console.log('You\'ll need your Cloudinary credentials from: https://cloudinary.com/console\n');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const updateEnvFile = (cloudName, apiKey, apiSecret) => {
  const envPath = path.join(__dirname, 'backend', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace placeholders with actual values
  envContent = envContent.replace('CLOUDINARY_CLOUD_NAME=your_cloud_name_here', `CLOUDINARY_CLOUD_NAME=${cloudName}`);
  envContent = envContent.replace('CLOUDINARY_API_KEY=your_api_key_here', `CLOUDINARY_API_KEY=${apiKey}`);
  envContent = envContent.replace('CLOUDINARY_API_SECRET=your_api_secret_here', `CLOUDINARY_API_SECRET=${apiSecret}`);
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated backend/.env file');
};

const updateFrontendConfig = (cloudName) => {
  const configPath = path.join(__dirname, 'frontend', 'src', 'lib', 'cloudinary.ts');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Replace placeholder with actual cloud name
  configContent = configContent.replace('your_cloud_name_here', cloudName);
  
  fs.writeFileSync(configPath, configContent);
  console.log('✅ Updated frontend/src/lib/cloudinary.ts file');
};

const main = async () => {
  try {
    console.log('📝 Please enter your Cloudinary credentials:\n');
    
    const cloudName = await askQuestion('Cloud Name: ');
    if (!cloudName) {
      console.log('❌ Cloud Name is required!');
      process.exit(1);
    }
    
    const apiKey = await askQuestion('API Key: ');
    if (!apiKey) {
      console.log('❌ API Key is required!');
      process.exit(1);
    }
    
    const apiSecret = await askQuestion('API Secret: ');
    if (!apiSecret) {
      console.log('❌ API Secret is required!');
      process.exit(1);
    }
    
    console.log('\n🔧 Configuring Cloudinary...');
    
    // Update configuration files
    updateEnvFile(cloudName, apiKey, apiSecret);
    updateFrontendConfig(cloudName);
    
    console.log('\n🎉 Cloudinary configuration completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: cd backend && node scripts/migrateImages.js');
    console.log('2. Follow the URL mapping output to replace image URLs');
    console.log('3. Test your application to verify images load correctly');
    console.log('\n📖 For detailed instructions, see: CLOUDINARY_SETUP_GUIDE.md');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
};

main();