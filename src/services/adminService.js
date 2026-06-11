const userRepository = require('../repositories/userRepository');
const roomRepository = require('../repositories/roomRepository');
const cloudinary = require('cloudinary');

// Cấu hình Cloudinary
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

  // Xóa ảnh trên Cloudinary
  if (room && room.images && room.images.length > 0) {
    for (const imageUrl of room.images) {
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.includes('cloudinary.com')) {
        const parts = imageUrl.split('/upload/');
        if (parts.length >= 2) {
          let publicIdWithExt = parts[1];
          if (publicIdWithExt.startsWith('v')) {
            const nextSlash = publicIdWithExt.indexOf('/');
            if (nextSlash !== -1) {
              publicIdWithExt = publicIdWithExt.substring(nextSlash + 1);
            }
          }
          const lastDot = publicIdWithExt.lastIndexOf('.');
          const publicId = lastDot !== -1 ? publicIdWithExt.substring(0, lastDot) : publicIdWithExt;

          try {
            const destroyResult = await cloudinary.v2.uploader.destroy(publicId);
            console.log(`Admin Deleted Cloudinary image: ${publicId}`, destroyResult);
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
