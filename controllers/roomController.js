const axios = require('axios');
const MOCK_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';
const ROOMS_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/rooms';

/**
 * Hiển thị Trang chủ danh sách phòng
 * Lấy dữ liệu từ MockAPI và đảo ngược mảng để tin mới nhất lên đầu
 */
exports.index = async (req, res) => {
  try {
    const usersResponse = await axios.get(MOCK_API_BASE);
    const roomsResponse = await axios.get(ROOMS_API_BASE);
    
    const rooms = roomsResponse.data.reverse(); // Tin mới lên đầu

    res.render('rooms/index', {
      title: 'Trọ Víp - Trang chủ',
      users: usersResponse.data,
      rooms: rooms,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Lỗi: ' + err.message);
  }
};

/**
 * Hiển thị giao diện Form Đăng phòng mới
 * (Chỉ dành cho quyền Admin)
 */
exports.newRoomForm = (req, res) => {
  res.render('admin/room/newrooms', {
    title: 'Thêm phòng mới',
    user: req.session.user
  });
};

/**
 * Xử lý logic Đăng phòng mới
 * - Xử lý mảng hình ảnh tải lên (qua multer)
 * - Đóng gói dữ liệu phòng và gửi POST lên MockAPI
 */
exports.createRoom = async (req, res) => {
  try {
    const { title, area, category, price, address, description, deposit, posterRole, status } = req.body;
    
    // Xử lý ảnh
    let imagesArr = [];
    if (req.files && req.files.length > 0) {
      imagesArr = req.files.map(file => '/uploads/' + file.filename);
    } else {
      imagesArr = ['https://via.placeholder.com/600x400?text=No+Image'];
    }

    const newRoom = {
      title,
      area: Number(area),
      status: status,
      category: category,
      price: Number(price),
      address,
      description,
      deposit: Number(deposit),
      host: {
        id: req.session.user.id,
        username: req.session.user.username,
        role: posterRole || 'Cá nhân'
      },
      images: imagesArr
    };

    await axios.post(ROOMS_API_BASE, newRoom);
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Lỗi khi thêm phòng: ' + err.message);
  }
};
