const roomService = require('../services/roomService');
const { ROLES } = require('../constants');

// =============================================
// SHARED HELPER
// =============================================

/**
 * Redirect về trang dashboard phù hợp theo role
 * @param {object} res - Express response
 * @param {object} user - Session user object
 */
function redirectToDashboard(res, user) {
  if (user.role === ROLES.ADMIN) {
    return res.redirect('/admin');
  }
  return res.redirect('/rooms/dashboard');
}

// =============================================
// CONTROLLERS
// =============================================

/**
 * Hiển thị Trang chủ danh sách phòng
 */
exports.index = async (req, res) => {
  try {
    const { rooms } = await roomService.getRoomsHome();

    res.render('rooms/index', {
      title: 'TrọVíp - Trang chủ',
      rooms,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Lỗi máy chủ khi tải danh sách phòng: ' + err.message);
  }
};

/**
 * Hiển thị form Đăng phòng mới
 */
exports.newRoomForm = (req, res) => {
  res.render('admin/room/newrooms', {
    title: 'Thêm phòng mới',
    user: req.session.user,
    error: null
  });
};

/**
 * Xử lý logic Đăng phòng mới
 */
exports.createRoom = async (req, res) => {
  try {
    await roomService.createRoom(req.body, req.files, req.session.user);
    redirectToDashboard(res, req.session.user);
  } catch (err) {
    res.render('admin/room/newrooms', {
      title: 'Thêm phòng mới',
      user: req.session.user,
      error: 'Lỗi khi lưu phòng: ' + err.message
    });
  }
};

/**
 * Hiển thị Bảng điều khiển dành cho Chủ trọ
 */
exports.landlordDashboard = async (req, res) => {
  try {
    const landlordRooms = await roomService.getLandlordRooms(req.session.user.id);

    res.render('rooms/dashboard', {
      title: 'Bảng điều khiển Chủ trọ',
      rooms: landlordRooms,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Lỗi máy chủ khi tải trang quản trị chủ trọ: ' + err.message);
  }
};

/**
 * Xóa phòng trọ (Chủ trọ hoặc Admin)
 */
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await roomService.deleteRoom(id, req.session.user);
    res.json({ success: true, message: 'Đã xóa phòng trọ thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa phòng trọ: ' + err.message });
  }
};

/**
 * Thay đổi trạng thái phòng (Chủ trọ hoặc Admin)
 */
exports.toggleRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const newStatus = await roomService.toggleRoomStatus(id, req.session.user);

    res.json({
      success: true,
      isAvailable: newStatus,
      message: `Đã chuyển trạng thái phòng thành: ${newStatus ? 'Còn phòng' : 'Hết phòng'}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái phòng: ' + err.message });
  }
};

/**
 * Hiển thị form chỉnh sửa phòng trọ
 */
exports.editRoomForm = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomService.getRoomForEdit(id, req.session.user);

    res.render('admin/room/editroom', {
      title: 'Chỉnh sửa tin đăng',
      user: req.session.user,
      room,
      error: null
    });
  } catch (err) {
    res.status(500).send('Lỗi máy chủ khi tải trang chỉnh sửa: ' + err.message);
  }
};

/**
 * Cập nhật thông tin phòng trọ
 */
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await roomService.updateRoom(id, req.body, req.files, req.session.user);
    redirectToDashboard(res, req.session.user);
  } catch (err) {
    res.render('admin/room/editroom', {
      title: 'Chỉnh sửa tin đăng',
      user: req.session.user,
      room: { id: req.params.id, ...req.body },
      error: 'Lỗi khi cập nhật phòng: ' + err.message
    });
  }
};
