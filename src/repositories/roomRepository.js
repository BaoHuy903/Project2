const axios = require('axios');
const { ROOMS_API_URL } = require('../config/api');

/**
 * Helper: Gọi axios với retry khi bị rate limit (429)
 */
const withRetry = async (fn, retries = 2, delayMs = 1500) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 && i < retries) {
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      // Thông báo lỗi rõ ràng hơn
      if (status === 429) {
        throw new Error('Hệ thống đang bận, vui lòng thử lại sau vài giây.');
      }
      throw err;
    }
  }
};

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
