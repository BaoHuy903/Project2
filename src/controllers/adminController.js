const adminService = require('../services/adminService');
const { ROLES } = require('../constants');

/**
 * Hiển thị Bảng điều khiển dành cho Admin
 */
exports.dashboard = async (req, res) => {
  try {
    const { users, rooms } = await adminService.getAdminDashboardData();
    res.render('admin/dashboard', {
      title: 'Bảng điều khiển Admin',
      users,
      rooms,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Lỗi máy chủ khi tải trang quản trị: ' + err.message);
  }
};

/**
 * Xóa người dùng (chỉ dành cho Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteUserByAdmin(id, req.session.user.id);
    res.json({ success: true, message: 'Đã xóa người dùng thành công!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Xóa phòng trọ (chỉ dành cho Admin)
 * Admin có toàn quyền → gọi adminService, không cần kiểm tra sở hữu
 */
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteRoomByAdmin(id);
    res.json({ success: true, message: 'Đã xóa phòng trọ thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa phòng trọ: ' + err.message });
  }
};

/**
 * Thay đổi trạng thái phòng (chỉ dành cho Admin)
 * Admin có toàn quyền → gọi adminService, không cần kiểm tra sở hữu
 */
exports.toggleRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const newStatus = await adminService.toggleRoomStatusByAdmin(id);

    res.json({
      success: true,
      isAvailable: newStatus,
      message: `Đã chuyển trạng thái phòng thành: ${newStatus ? 'Còn phòng' : 'Hết phòng'}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái phòng: ' + err.message });
  }
};
