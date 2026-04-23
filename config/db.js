
// ===== LƯU Ý: KHÔNG CẦN KẾT NỐI DATABASE =====
// Ứng dụng hiện tại đang sử dụng MockAPI thay vì MongoDB
// File này có thể xóa được, nhưng để lại để tham khảo

/*
// Tải thư viện mongoose để tương tác với MongoDB
const mongoose = require('mongoose');
// Tải các biến môi trường
const dotenv = require('dotenv');
dotenv.config();

// Lấy URI kết nối MongoDB từ biến môi trường
// Nếu không có, sử dụng MongoDB địa phương (mặc định localhost:27017/shop_auth)
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shop_auth';

// Kết nối với MongoDB
mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB đã kết nối')) // Thông báo thành công
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err)); // Thông báo lỗi

// Xuất mongoose để sử dụng ở các file khác
module.exports = mongoose;
*/

module.exports = {};