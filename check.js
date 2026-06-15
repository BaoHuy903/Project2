const fs = require('fs');

// ============ CHECK QUAN TRỌNG: Lỗi tiềm ẩn trong code ============

// 1. roomFormValidation - amenities trong edit form: khi submit thì amenities = [] nếu không check nào được chọn
// → Đây là lỗi: update room với amenities=[] nếu user bỏ tick hết
// Kiểm tra xem updateRoom có handle case amenities=undefined không
const roomService = fs.readFileSync('src/services/roomService.js', 'utf8');
// Trong updateRoom: nếu roomData.amenities = undefined (không có checkbox nào) → giữ nguyên amenities cũ
// Đây là bug: nếu user muốn xóa hết amenities thì không được
console.log('=== AMENITIES UPDATE BUG CHECK ===');
// Khi form submit, nếu không tick checkbox nào, req.body.amenities = undefined
// Code hiện tại: if (roomData.amenities) { ... } else { amenitiesArr = room.amenities || [] }
// Vậy không thể xóa hết amenities - OK cho UX nhưng là limitation
const hasAmenitiesGuard = roomService.includes('amenitiesArr = room.amenities || []');
console.log((hasAmenitiesGuard ? 'NOTE' : 'OK') + ' Update keeps old amenities if none submitted');

// 2. File upload - multer-storage-cloudinary v2.2.1 có thể trả về path hoặc secure_url
// Check roomService xử lý đúng không
const hasSecureUrl = roomService.includes('file.secure_url || file.url || file.path');
console.log((hasSecureUrl ? 'OK' : 'BUG') + ' File URL fallback chain correct');

// 3. session user favorites - sau toggle, session cập nhật không?
const userCtrl = fs.readFileSync('src/controllers/userController.js', 'utf8');
const hasFavSync = userCtrl.includes('req.session.user.favorites = updatedFavorites');
console.log((hasFavSync ? 'OK' : 'BUG') + ' Session favorites synced after toggle');

// 4. deleteRoom trong rooms/dashboard.js gọi /rooms/:id nhưng landlord dashboard
// Vấn đề: URL endpoint DELETE /rooms/:id yêu cầu isLandlordOrAdmin
const dashJS = fs.readFileSync('src/public/js/rooms/dashboard.js', 'utf8');
const callsRoomsDelete = dashJS.includes('/rooms/${id}');
console.log((callsRoomsDelete ? 'OK' : 'BUG') + ' Landlord dashboard calls /rooms/:id for delete');

// 5. admin/dashboard.js gọi /admin/rooms/:id cho delete - đúng
const adminDashJS = fs.readFileSync('src/public/js/admin/dashboard.js', 'utf8');
const adminCallsAdminDelete = adminDashJS.includes('/admin/rooms/${id}');
console.log((adminCallsAdminDelete ? 'OK' : 'BUG') + ' Admin dashboard calls /admin/rooms/:id for delete');

// 6. Kiểm tra 403 redirect thân thiện hơn
const authMW = fs.readFileSync('src/middleware/auth.js', 'utf8');
const has403 = authMW.includes('403');
console.log((has403 ? 'NOTE' : 'OK') + ' Auth middleware returns 403 (consider redirect)');

// 7. landing page - roomDetailModal fav button display:none !important - đúng vì user chưa login
const landing = fs.readFileSync('src/views/pages/landing.ejs', 'utf8');
const favBtnHidden = landing.includes('display: none !important');
console.log((favBtnHidden ? 'OK' : 'BUG') + ' Landing modal fav button hidden for guests');

// 8. editroom - xử lý khi amenities = undefined (user bỏ hết tick)
// Fix cần: add hidden input với value="" khi không có amenity nào
const editRoom = fs.readFileSync('src/views/pages/admin/room/editroom.ejs', 'utf8');
const hasAmenitiesHidden = editRoom.includes('name="amenities_clear"') || editRoom.includes('amenities[]');
console.log((hasAmenitiesHidden ? 'OK' : 'NOTE') + ' EditRoom has amenities clear mechanism');

// 9. Kiểm tra rooms/index.ejs - user variable đang được truyền từ controller
const roomsIndex = fs.readFileSync('src/views/pages/rooms/index.ejs', 'utf8');
const usesUserVar = roomsIndex.includes('<% if (user) {') || roomsIndex.includes('<% if(user)');
console.log((usesUserVar ? 'OK' : 'BUG') + ' rooms/index uses user variable from controller');

// 10. Check tất cả views không dùng sessionUser thay cho user
const viewFiles = [
  'src/views/pages/rooms/index.ejs',
  'src/views/pages/rooms/dashboard.ejs', 
  'src/views/pages/admin/dashboard.ejs',
  'src/views/pages/admin/room/newrooms.ejs',
  'src/views/pages/admin/room/editroom.ejs',
];
console.log('\n=== VARIABLE CONSISTENCY CHECK ===');
viewFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const usesUser = content.includes('user.username') || content.includes('user.role');
  const usesSessionUser = content.includes('sessionUser.username') || content.includes('sessionUser.role');
  const name = f.split('/').pop();
  if (usesUser && usesSessionUser) {
    console.log('MIXED ' + name + ' uses BOTH user and sessionUser!');
  } else if (usesUser) {
    console.log('OK ' + name + ' uses user (from controller)');
  } else if (usesSessionUser) {
    console.log('OK ' + name + ' uses sessionUser (from locals)');
  } else {
    console.log('OK ' + name + ' no direct user access');
  }
});
