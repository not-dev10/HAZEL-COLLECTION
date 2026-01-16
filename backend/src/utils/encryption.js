import crypto from 'crypto';

/**
 * Field-Level Encryption for PII (Personally Identifiable Information)
 * Uses AES-256-GCM for authenticated encryption
 */

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

/**
 * Encrypt sensitive text
 * @param {string} text - Plain text to encrypt
 * @returns {object} - Encrypted data with IV and auth tag
 */
export function encrypt(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  try {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();

    return {
      data: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * @param {object} enc - Encrypted object with data, iv, and tag
 * @returns {string} - Decrypted plain text
 */
export function decrypt(enc) {
  if (!enc || !enc.data || !enc.iv || !enc.tag) {
    return null;
  }

  try {
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(enc.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(enc.tag, 'hex'));
    
    const decrypted = decipher.update(enc.data, 'hex', 'utf8') + decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Encrypt PII fields in an object
 * @param {object} data - Object containing PII fields
 * @param {array} fields - Array of field names to encrypt
 * @returns {object} - Object with encrypted fields
 */
export function encryptFields(data, fields = []) {
  const encrypted = { ...data };
  
  for (const field of fields) {
    if (data[field]) {
      encrypted[field] = encrypt(data[field]);
    }
  }
  
  return encrypted;
}

/**
 * Decrypt PII fields in an object
 * @param {object} data - Object containing encrypted fields
 * @param {array} fields - Array of field names to decrypt
 * @returns {object} - Object with decrypted fields
 */
export function decryptFields(data, fields = []) {
  const decrypted = { ...data };
  
  for (const field of fields) {
    if (data[field] && typeof data[field] === 'object') {
      decrypted[field] = decrypt(data[field]);
    }
  }
  
  return decrypted;
}

/**
 * Encrypt address object
 * @param {object} address - Address object
 * @returns {object} - Address with encrypted fields
 */
export function encryptAddress(address) {
  if (!address) return null;
  
  return {
    line1: address.line1 ? encrypt(address.line1) : null,
    line2: address.line2 ? encrypt(address.line2) : null,
    city: address.city ? encrypt(address.city) : null,
    state: address.state, // Not encrypted (used for shipping calculations)
    pincode: address.pincode ? encrypt(address.pincode) : null,
    country: address.country // Not encrypted (used for shipping)
  };
}

/**
 * Decrypt address object
 * @param {object} address - Encrypted address object
 * @returns {object} - Decrypted address
 */
export function decryptAddress(address) {
  if (!address) return null;
  
  return {
    line1: address.line1 ? decrypt(address.line1) : null,
    line2: address.line2 ? decrypt(address.line2) : null,
    city: address.city ? decrypt(address.city) : null,
    state: address.state,
    pincode: address.pincode ? decrypt(address.pincode) : null,
    country: address.country
  };
}

/**
 * Check if field is encrypted
 * @param {any} field - Field to check
 * @returns {boolean} - True if encrypted
 */
export function isEncrypted(field) {
  return field && typeof field === 'object' && field.data && field.iv && field.tag;
}

/**
 * Migrate plain text to encrypted (for gradual migration)
 * @param {string|object} field - Plain text or encrypted field
 * @returns {object} - Encrypted field
 */
export function migrateToEncrypted(field) {
  if (isEncrypted(field)) {
    return field; // Already encrypted
  }
  
  if (typeof field === 'string') {
    return encrypt(field); // Encrypt plain text
  }
  
  return null;
}
