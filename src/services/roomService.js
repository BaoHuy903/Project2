const roomRepository = require('../repositories/roomRepository');
const { ROLES, DEFAULT_HOTLINE } = require('../constants');
const cloudinary = require('cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Lấy danh sách phòng cho trang chủ
 * Không cần fetch users — trang chủ chỉ hiển thị danh sách phòng
 */
const getRoomsHome = async () => {
  const rooms = await roomRepository.getAllRooms();
  return {
    rooms: rooms.reverse() // Tin mới nhất lên đầu
  };
};

/**
 * Lấy danh sách phòng thuộc sở hữu của Chủ trọ
 */
const getLandlordRooms = async (landlordId) => {
  const rooms = await roomRepository.getAllRooms();
  return rooms.filter(r => String(r.host && r.host.id) === String(landlordId));
};

/**
 * Đăng tin phòng trọ mới
 */
const createRoom = async (roomData, files, sessionUser) => {
  // Xử lý hình ảnh
  let imagesArr = [];
  if (files && files.length > 0) {
    imagesArr = files.map(file => file.secure_url || file.url || file.path);
  } else {
    // Ảnh mặc định
    imagesArr = ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=400&q=80'];
  }

  const newRoom = {
    title: roomData.title.trim(),
    area: Number(roomData.area),
    status: roomData.status,
    category: roomData.category || 'Nội thất cơ bản',
    price: Number(roomData.price),
    address: roomData.address,
    description: roomData.description.trim(),
    deposit: Number(roomData.deposit || 0),
    phone: roomData.phone ? roomData.phone.trim() : DEFAULT_HOTLINE,
    depositMonth: roomData.depositMonth ? Number(roomData.depositMonth) : null,
    paymentCycle: roomData.paymentCycle ? roomData.paymentCycle.trim() : '',
    parking: roomData.parking ? roomData.parking.trim() : '',
    electricityPrice: roomData.electricityPrice ? Number(roomData.electricityPrice) : null,
    waterPrice: roomData.waterPrice ? Number(roomData.waterPrice) : null,
    host: {
      id: sessionUser.id,
      username: sessionUser.username,
      role: sessionUser.role === ROLES.ADMIN ? 'Admin' : 'Chủ trọ'
    },
    images: imagesArr,
    isAvailable: true,
    createdAt: new Date().toISOString()
  };

  return roomRepository.createRoom(newRoom);
};

/**
 * Lấy phòng để chỉnh sửa (Kiểm tra quyền sở hữu)
 */
const getRoomForEdit = async (roomId, sessionUser) => {
  const room = await roomRepository.getRoomById(roomId);

  // Kiểm tra quyền sở hữu hoặc admin
  const isOwner = String(room.host && room.host.id) === String(sessionUser.id);
  const isAdmin = sessionUser.role === ROLES.ADMIN;

  if (!isAdmin && !isOwner) {
    throw new Error('Bạn không có quyền chỉnh sửa phòng trọ này.');
  }

  return room;
};

/**
 * Cập nhật thông tin phòng trọ
 */
const updateRoom = async (roomId, roomData, files, sessionUser) => {
  const room = await roomRepository.getRoomById(roomId);

  // Kiểm tra quyền sở hữu hoặc admin
  const isOwner = String(room.host && room.host.id) === String(sessionUser.id);
  const isAdmin = sessionUser.role === ROLES.ADMIN;

  if (!isAdmin && !isOwner) {
    throw new Error('Bạn không có quyền chỉnh sửa phòng trọ này.');
  }

  // Xử lý ảnh: Nếu có tải ảnh mới thì cập nhật, ngược lại giữ nguyên ảnh cũ
  let imagesArr = room.images || [];
  if (files && files.length > 0) {
    imagesArr = files.map(file => file.secure_url || file.url || file.path);
  }

  const updatedRoom = {
    ...room,
    title: roomData.title.trim(),
    area: Number(roomData.area),
    status: roomData.status,
    category: roomData.category || 'Nội thất cơ bản',
    price: Number(roomData.price),
    address: roomData.address,
    description: roomData.description.trim(),
    deposit: Number(roomData.deposit || 0),
    phone: roomData.phone ? roomData.phone.trim() : DEFAULT_HOTLINE,
    depositMonth: roomData.depositMonth ? Number(roomData.depositMonth) : null,
    paymentCycle: roomData.paymentCycle ? roomData.paymentCycle.trim() : '',
    parking: roomData.parking ? roomData.parking.trim() : '',
    electricityPrice: roomData.electricityPrice ? Number(roomData.electricityPrice) : null,
    waterPrice: roomData.waterPrice ? Number(roomData.waterPrice) : null,
    images: imagesArr
  };

  return roomRepository.updateRoom(roomId, updatedRoom);
};

/**
 * Thay đổi trạng thái trống/đã thuê
 */
const toggleRoomStatus = async (roomId, sessionUser) => {
  const room = await roomRepository.getRoomById(roomId);

  // Kiểm tra quyền sở hữu hoặc admin
  const isOwner = String(room.host && room.host.id) === String(sessionUser.id);
  const isAdmin = sessionUser.role === ROLES.ADMIN;

  if (!isAdmin && !isOwner) {
    throw new Error('Bạn không có quyền thay đổi trạng thái phòng trọ này!');
  }

  const currentStatus = room.isAvailable !== false;
  const newStatus = !currentStatus;

  const updatedRoom = {
    ...room,
    isAvailable: newStatus
  };

  await roomRepository.updateRoom(roomId, updatedRoom);
  return newStatus;
};

/**
 * Xóa phòng trọ
 */
const deleteRoom = async (roomId, sessionUser) => {
  const room = await roomRepository.getRoomById(roomId);

  // Kiểm tra quyền sở hữu hoặc admin
  const isOwner = String(room.host && room.host.id) === String(sessionUser.id);
  const isAdmin = sessionUser.role === ROLES.ADMIN;

  if (!isAdmin && !isOwner) {
    throw new Error('Bạn không có quyền xóa phòng trọ này!');
  }

  // Xóa ảnh trên Cloudinary
  if (room.images && room.images.length > 0) {
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
            await cloudinary.v2.uploader.destroy(publicId);
          } catch (err) {
            console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
          }
        }
      }
    }
  }

  return roomRepository.deleteRoom(roomId);
};

module.exports = {
  getRoomsHome,
  getLandlordRooms,
  createRoom,
  getRoomForEdit,
  updateRoom,
  toggleRoomStatus,
  deleteRoom
};
