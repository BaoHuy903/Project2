# Trọ Víp - Website Tìm Kiếm & Quản Lý Phòng Trọ Đà Nẵng

**Trọ Víp** là một ứng dụng web MVC được phát triển bằng Node.js và Express, sử dụng EJS làm View Engine, Bootstrap 5 cho giao diện và MockAPI làm cơ sở dữ liệu giả lập. Dự án hỗ trợ người dùng tìm kiếm phòng trọ nhanh chóng, lưu tin đăng yêu thích và cho phép quản trị viên quản lý phòng trọ cũng như người dùng.

---

## 🚀 Các Tính Năng Đã Hoàn Thiện

### 1. Dành cho Khách & Người dùng (User)
- **Đăng ký & Đăng nhập:** Bảo mật mật khẩu bằng `bcrypt`, validation thời gian thực ở cả Frontend (độ dài, ký tự đặc biệt, kiểm tra độ mạnh mật khẩu) và Backend.
- **Tìm kiếm thông minh:** Ô tìm kiếm tức thì theo tiêu đề và địa chỉ.
- **Bộ lọc đa dạng:** Lọc nhanh theo Địa điểm (quận Hải Châu, Thanh Khê...), Loại phòng (Ở đơn, Ở ghép), Khoảng giá thuê, Diện tích phòng, và Tình trạng nội thất.
- **Lưu tin yêu thích (Favorites):** Lưu trữ danh sách phòng yêu thích cá nhân vào `localStorage`, lọc nhanh các tin đã lưu qua biểu tượng Trái tim trên thanh Navbar.
- **Xem chi tiết phòng trọ:** Modal thông tin chi tiết hiện đại tích hợp slide ảnh, thông tin tiền cọc, mô tả và nút kết nối trực tiếp đến chủ trọ (Gọi điện thoại & Chat Zalo).

### 2. Dành cho Quản trị viên (Admin)
- **Dashboard quản trị:** Thống kê trực quan (Tổng số user, tổng số phòng, phòng trống, phòng đã thuê).
- **Quản lý người dùng:** Danh sách tài khoản và quyền xóa người dùng trực tiếp qua API Fetch.
- **Quản lý phòng trọ:** Quản lý danh sách tin đăng, xóa phòng trọ hoặc thay đổi trạng thái thuê phòng (Còn trống / Đã thuê) tức thì không cần tải lại trang.
- **Thêm phòng trọ mới:** Form thêm phòng trọ với floating labels hiện đại, upload nhiều hình ảnh cùng validation chặt chẽ.

---

## 🛠 Công Nghệ Sử Dụng
- **Backend:** Node.js, Express.js (MVC Pattern).
- **Frontend:** HTML5, CSS3, Javascript (Vanilla), EJS Template Engine, Bootstrap 5 & Bootstrap Icons.
- **Database:** MockAPI (Giả lập RESTful API).
- **Thư viện chính:** `axios` (gọi API), `bcrypt` (mã hóa mật khẩu), `express-session` (quản lý phiên đăng nhập), `dotenv` (quản lý biến môi trường), `multer` (upload file).

---

## 💻 Hướng Dẫn Chạy Dự Án

### 1. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục gốc của dự án và chạy lệnh:
```bash
npm install
```

### 2. Cấu hình biến môi trường
Dự án sử dụng tệp `.env` để quản lý cấu hình. Một tệp `.env` đã được tạo sẵn tại thư mục gốc với nội dung:
```env
PORT=3000
SESSION_SECRET=tro_vip_secret_key_12345
USERS_API_URL=https://69d242005043d95be971a7a0.mockapi.io/api/v1/users
ROOMS_API_URL=https://69d242005043d95be971a7a0.mockapi.io/api/v1/rooms
```

### 3. Khởi chạy ứng dụng

#### Chế độ Phát triển (Development Mode - Sử dụng Nodemon):
```bash
npm run dev
```

#### Chế độ Production:
```bash
npm start
```

Sau khi chạy lệnh, truy cập ứng dụng tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Tài Khoản Thử Nghiệm

Bạn có thể tự đăng ký tài khoản mới hoặc sử dụng tài khoản có sẵn dưới đây để kiểm tra chức năng:

- **Tài khoản ADMIN:**
  - **Tài khoản:** `admin`
  - **Mật khẩu:** `admin123`

- **Tài khoản USER (Người dùng thường):**
  - **Tài khoản:** `user`
  - **Mật khẩu:** `user123` *(hoặc tự đăng ký trên giao diện)*

---

## 📂 Cấu Trúc Dự Án
```text
Project2/
├── config/
│   └── db.js            # Khai báo cấu hình kết nối DB
├── controllers/
│   ├── adminController.js # Nghiệp vụ trang quản trị, CRUD users & rooms
│   ├── roomController.js  # Nghiệp vụ hiển thị & thêm phòng trọ
│   └── userController.js  # Nghiệp vụ đăng ký, đăng nhập & đăng xuất
├── middleware/
│   └── auth.js          # Middleware xác thực đăng nhập & phân quyền admin
├── models/
│   └── User.js          # Logic kiểm tra sức mạnh mật khẩu và mã hóa
├── public/
│   ├── css/             # Tệp tin phong cách CSS (admin, rooms)
│   └── uploads/         # Thư mục lưu trữ hình ảnh phòng trọ tải lên
├── routes/
│   ├── adminRoutes.js   # Các định tuyến quản trị admin
│   ├── roomRoutes.js    # Các định tuyến danh sách và thêm phòng trọ
│   └── userRoutes.js    # Các định tuyến thành viên đăng ký/đăng nhập
├── views/
│   ├── admin/           # Views quản trị (dashboard, form đăng tin)
│   ├── rooms/           # Views trang chủ hiển thị phòng trọ
│   └── users/           # Views đăng nhập, đăng ký
├── .env                 # Tệp chứa biến môi trường (port, API URL, secret)
├── app.js               # File cấu hình khởi chạy chính của dự án
└── package.json         # Danh sách thư viện và scripts chạy dự án
```
