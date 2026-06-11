const axios = require('axios');
const { USERS_API_URL } = require('../config/api');

/**
 * Lấy danh sách tất cả người dùng
 */
const getAllUsers = async () => {
  const response = await axios.get(USERS_API_URL);
  // Normalize roles to uppercase
  return response.data.map(user => ({
    ...user,
    role: user.role ? user.role.toUpperCase() : user.role
  }));
};

/**
 * Tìm người dùng theo ID
 */
const getUserById = async (id) => {
  const response = await axios.get(`${USERS_API_URL}/${id}`);
  const user = response.data;
  // Normalize role to uppercase
  if (user && user.role) {
    user.role = user.role.toUpperCase();
  }
  return user;
};

/**
 * Tìm người dùng theo tên đăng nhập (username)
 */
const getUserByUsername = async (username) => {
  const users = await getAllUsers();
  const user = users.find(u => u.username === username);
  // Normalize role to uppercase
  if (user && user.role) {
    user.role = user.role.toUpperCase();
  }
  return user;
};

/**
 * Tạo người dùng mới
 */
const createUser = async (userData) => {
  const response = await axios.post(USERS_API_URL, userData);
  return response.data;
};

/**
 * Cập nhật thông tin người dùng
 */
const updateUser = async (id, userData) => {
  const response = await axios.put(`${USERS_API_URL}/${id}`, userData);
  return response.data;
};

/**
 * Xóa người dùng
 */
const deleteUser = async (id) => {
  const response = await axios.delete(`${USERS_API_URL}/${id}`);
  return response.data;
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser
};
