const userRepository = require('../repositories/userRepository');
const User = require('../models/User');

/**
 * Đăng ký tài khoản mới
 */
const registerUser = async (username, password, role) => {
  const existingUser = await userRepository.getUserByUsername(username);
  if (existingUser) {
    throw new Error('Username đã tồn tại');
  }

  const hashedPassword = await User.hashPassword(password);
  
  return userRepository.createUser({
    username,
    password: hashedPassword,
    role
  });
};

/**
 * Xác thực đăng nhập
 */
const loginUser = async (username, password) => {
  const user = await userRepository.getUserByUsername(username);
  if (!user) {
    throw new Error('Sai tài khoản hoặc mật khẩu');
  }

  const isMatch = await User.comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error('Sai tài khoản hoặc mật khẩu');
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role || 'TENANT',
    favorites: user.favorites || []
  };
};

/**
 * Thay đổi mật khẩu
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const dbUser = await userRepository.getUserById(userId);
  if (!dbUser) {
    throw new Error('Người dùng không tồn tại');
  }

  const isMatch = await User.comparePassword(currentPassword, dbUser.password);
  if (!isMatch) {
    throw new Error('Mật khẩu hiện tại không chính xác.');
  }

  const hashedNewPassword = await User.hashPassword(newPassword);
  
  return userRepository.updateUser(userId, {
    ...dbUser,
    password: hashedNewPassword
  });
};

/**
 * Đặt lại mật khẩu (Quên mật khẩu)
 */
const forgotPassword = async (username, newPassword) => {
  const dbUser = await userRepository.getUserByUsername(username);
  if (!dbUser) {
    throw new Error('Tài khoản không tồn tại trên hệ thống.');
  }

  const hashedNewPassword = await User.hashPassword(newPassword);
  
  return userRepository.updateUser(dbUser.id, {
    ...dbUser,
    password: hashedNewPassword
  });
};

/**
 * Toggle phòng trọ yêu thích của người dùng trong cơ sở dữ liệu
 */
const toggleFavorite = async (userId, roomId) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  let favorites = user.favorites || [];
  const index = favorites.indexOf(String(roomId));
  if (index === -1) {
    favorites.push(String(roomId));
  } else {
    favorites.splice(index, 1);
  }

  const updatedUser = {
    ...user,
    favorites
  };

  await userRepository.updateUser(userId, updatedUser);
  return favorites;
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  toggleFavorite
};
