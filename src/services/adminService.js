const userRepository = require('../repositories/userRepository');
const roomRepository = require('../repositories/roomRepository');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  const room = await roomRepository.getRoomById(roomId);

  if (room?.images?.length) {
    for (const url of room.images) {
      if (typeof url === 'string' && url.includes('cloudinary.com')) {
        const parts = url.split('/upload/');
        if (parts.length >= 2) {
          let publicId = parts[1].replace(/^v\d+\//, '').split('.')[0];
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error(`Admin Failed to delete Cloudinary image: ${publicId}`, err);
          }
        }
      }
    }
  }

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
