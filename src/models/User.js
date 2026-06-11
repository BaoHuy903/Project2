const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const validatePasswordStrength = (password) => {
  // Tối thiểu 6 ký tự, phải có ít nhất 1 chữ cái và 1 chữ số
  if (!password || password.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

// Export utility functions
module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};