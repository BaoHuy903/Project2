const roomRepository = require('../repositories/roomRepository');
const { ROLES, DEFAULT_HOTLINE } = require('../constants');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const parseAmenities = (amenities) => {
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === 'string') return amenities.split(',').map(a => a.trim()).filter(Boolean);
  return [];
};

const deleteCloudinaryImages = async (images) => {
  if (!images?.length) return;
  for (const url of images) {
    if (typeof url === 'string' && url.includes('cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length >= 2) {
        let publicId = parts[1].replace(/^v\d+\//, '').split('.')[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error(`Failed to delete Cloudinary image: ${publicId}`, err);
        }
      }
    }
  }
};

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
  const imagesArr = files?.length 
    ? files.map(file => file.secure_url || file.url || file.path)
    : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=400&q=80'];

  const amenitiesArr = parseAmenities(roomData.amenities);

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
    availableFrom: roomData.availableFrom ? roomData.availableFrom : null,
    amenities: amenitiesArr,
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

  let imagesArr = Object.prototype.hasOwnProperty.call(roomData, 'keepImages')
    ? (roomData.keepImages ? roomData.keepImages.split(',').map(img => img.trim()).filter(Boolean) : [])
    : (room.images || []);

  if (files?.length) {
    imagesArr.push(...files.map(file => file.secure_url || file.url || file.path));
  }

  const amenitiesArr = parseAmenities(roomData.amenities);

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
    availableFrom: roomData.availableFrom ? roomData.availableFrom : null,
    amenities: amenitiesArr,
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

  await deleteCloudinaryImages(room.images);

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
