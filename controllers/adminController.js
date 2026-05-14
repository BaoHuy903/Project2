const axios = require('axios');
const MOCK_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';
const ROOMS_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/rooms';

/**
 * Hiển thị Bảng điều khiển dành cho Admin
 * Tải danh sách tất cả Users từ MockAPI để quản lý
 */
exports.dashboard = async (req, res) => {
  try {
    const response = await axios.get(MOCK_API_BASE);
    res.render('admin/dashboard', {
      title: 'Bảng điều khiển Admin',
      users: response.data,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Lỗi Admin: ' + err.message);
  }
};
