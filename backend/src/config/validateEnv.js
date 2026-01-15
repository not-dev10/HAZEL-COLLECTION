/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before app startup
 */

export function validateEnvironment() {
  const required = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  const optional = [
    'ENCRYPTION_KEY'
  ];

  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\n📋 Please set these variables in your .env file');
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️ WARNING: JWT_SECRET should be at least 32 characters for security');
  }

  // Validate ENCRYPTION_KEY if provided
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
    console.warn('⚠️ WARNING: ENCRYPTION_KEY should be exactly 64 hex characters (32 bytes)');
  }

  // Validate NODE_ENV
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    console.error('❌ CRITICAL: NODE_ENV must be development, production, or test');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
}
