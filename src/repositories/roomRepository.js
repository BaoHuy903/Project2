const axios = require('axios');
const { ROOMS_API_URL, withRetry } = require('../config/api');

/**
 * Lấy danh sách tất cả phòng trọ
 */
const getAllRooms = async () => {
  const response = await withRetry(() => axios.get(ROOMS_API_URL));
  return response.data;
};

/**
 * Tìm phòng trọ theo ID
 */
const getRoomById = async (id) => {
  const response = await withRetry(() => axios.get(`${ROOMS_API_URL}/${id}`));
  return response.data;
};

/**
 * Tạo tin đăng phòng trọ mới
 */
const createRoom = async (roomData) => {
  const response = await withRetry(() => axios.post(ROOMS_API_URL, roomData));
  return response.data;
};

/**
 * Cập nhật tin đăng phòng trọ
 */
const updateRoom = async (id, roomData) => {
  const response = await withRetry(() => axios.put(`${ROOMS_API_URL}/${id}`, roomData));
  return response.data;
};

/**
 * Xóa tin đăng phòng trọ
 */
const deleteRoom = async (id) => {
  const response = await withRetry(() => axios.delete(`${ROOMS_API_URL}/${id}`));
  return response.data;
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
