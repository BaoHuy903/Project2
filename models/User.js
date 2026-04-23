// Load bcrypt library for secure password hashing
const bcrypt = require('bcrypt');

// UTILITY FUNCTION: Hash a password using bcrypt
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// UTILITY FUNCTION: Compare plain password with hashed password
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// UTILITY FUNCTION: Validate password strength
function validatePasswordStrength(password) {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { valid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
  }
  return { valid: true, message: 'Password is strong' };
}

// Export utility functions
module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
