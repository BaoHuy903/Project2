const userRepository = require('../repositories/userRepository');
const roomRepository = require('../repositories/roomRepository');

/**
 * Lấy toàn bộ dữ liệu người dùng và phòng trọ cho dashboard admin
 */
const getAdminDashboardData = async () => {
  const users = await userRepository.getAllUsers();
  const rooms = await roomRepository.getAllRooms();
  return {
    users,
    rooms: rooms.reverse() // Tin mới nhất lên đầu
  };
};

/**
 * Admin thực hiện xóa người dùng
 * Kiểm tra nghiệp vụ: Admin không được tự xóa chính mình
 */
const deleteUserByAdmin = async (userIdToDelete, currentAdminId) => {
  if (String(userIdToDelete) === String(currentAdminId)) {
    throw new Error('Bạn không thể tự xóa tài khoản của chính mình!');
  }
  return userRepository.deleteUser(userIdToDelete);
};

/**
 * Admin thực hiện xóa phòng trọ (không giới hạn quyền sở hữu)
 */
const deleteRoomByAdmin = async (roomId) => {
  // Admin có toàn quyền xóa mọi phòng, không cần kiểm tra sở hữu
  return roomRepository.deleteRoom(roomId);
};

/**
 * Admin thực hiện chuyển trạng thái phòng (không giới hạn quyền sở hữu)
 */
const toggleRoomStatusByAdmin = async (roomId) => {
  const room = await roomRepository.getRoomById(roomId);
  const currentStatus = room.isAvailable !== false;
  const newStatus = !currentStatus;

  await roomRepository.updateRoom(roomId, { ...room, isAvailable: newStatus });
  return newStatus;
};

module.exports = {
  getAdminDashboardData,
  deleteUserByAdmin,
  deleteRoomByAdmin,
  toggleRoomStatusByAdmin
};
