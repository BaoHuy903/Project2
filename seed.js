const axios = require('axios');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { USERS_API_URL, ROOMS_API_URL } = require('./src/config/api');

// Helper to delay between requests if MockAPI rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sampleImages = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&h=400&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&h=400&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&h=400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&h=400&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&h=400&q=80'
];

const danangDistricts = [
  'Hải Châu',
  'Thanh Khê',
  'Liên Chiểu',
  'Ngũ Hành Sơn',
  'Sơn Trà',
  'Cẩm Lệ'
];

// Tuyến đường thực tế theo từng quận
const districtStreets = {
  'Hải Châu': ['Nguyễn Hữu Thọ', 'Lê Thanh Nghị', 'Núi Thành', 'Trưng Nữ Vương', 'Phan Đăng Lưu'],
  'Thanh Khê': ['Điện Biên Phủ', 'Trần Cao Vân', 'Nguyễn Hoàng', 'Lê Duẩn', 'Kỳ Đồng'],
  'Liên Chiểu': ['Tôn Đức Thắng', 'Ngô Sĩ Liên', 'Nguyễn Lương Bằng', 'Phạm Như Xương', 'Nam Cao'],
  'Ngũ Hành Sơn': ['Châu Thị Vĩnh Tế', 'Phan Tứ', 'Ngũ Hành Sơn', 'Ngô Thì Sĩ', 'Lê Văn Hiến'],
  'Sơn Trà': ['Ngô Quyền', 'Tô Hiến Thành', 'Phạm Văn Đồng', 'Nguyễn Duy Hiệu', 'Trần Hưng Đạo'],
  'Cẩm Lệ': ['Cách Mạng Tháng Tám', 'Ông Ích Đường', 'Nguyễn Hữu Tiến', 'Lê Đại Hành', 'Bùi Xương Trạch']
};

// Phường thực tế theo từng quận ở Đà Nẵng
const districtWards = {
  'Hải Châu': [
    'Phường Hòa Cường Bắc, Quận Hải Châu',
    'Phường Hòa Cường Nam, Quận Hải Châu',
    'Phường Hòa Thuận Đông, Quận Hải Châu',
    'Phường Hòa Thuận Tây, Quận Hải Châu',
    'Phường Hải Châu I, Quận Hải Châu',
    'Phường Hải Châu II, Quận Hải Châu',
    'Phường Phước Ninh, Quận Hải Châu',
    'Phường Nam Dương, Quận Hải Châu',
    'Phường Thạch Thang, Quận Hải Châu',
    'Phường Thanh Bình, Quận Hải Châu',
    'Phường Thuận Phước, Quận Hải Châu',
    'Phường Bình Thuận, Quận Hải Châu',
    'Phường Bình Hiên, Quận Hải Châu'
  ],
  'Thanh Khê': [
    'Phường Thạc Gián, Quận Thanh Khê',
    'Phường Vĩnh Trung, Quận Thanh Khê',
    'Phường Tân Lập, Quận Thanh Khê',
    'Phường Chính Gián, Quận Thanh Khê',
    'Phường Tam Thuận, Quận Thanh Khê',
    'Phường Xuân Hà, Quận Thanh Khê',
    'Phường An Khê, Quận Thanh Khê',
    'Phường Hòa Khê, Quận Thanh Khê',
    'Phường Thanh Khê Đông, Quận Thanh Khê',
    'Phường Thanh Khê Tây, Quận Thanh Khê'
  ],
  'Sơn Trà': [
    'Phường An Hải Bắc, Quận Sơn Trà',
    'Phường An Hải Tây, Quận Sơn Trà',
    'Phường An Hải Đông, Quận Sơn Trà',
    'Phường Phước Mỹ, Quận Sơn Trà',
    'Phường Mân Thái, Quận Sơn Trà',
    'Phường Nại Hiên Đông, Quận Sơn Trà',
    'Phường Thọ Quang, Quận Sơn Trà'
  ],
  'Ngũ Hành Sơn': [
    'Phường Mỹ An, Quận Ngũ Hành Sơn',
    'Phường Khuê Mỹ, Quận Ngũ Hành Sơn',
    'Phường Hòa Hải, Quận Ngũ Hành Sơn',
    'Phường Hòa Quý, Quận Ngũ Hành Sơn'
  ],
  'Liên Chiểu': [
    'Phường Hòa Minh, Quận Liên Chiểu',
    'Phường Hòa Khánh Nam, Quận Liên Chiểu',
    'Phường Hòa Khánh Bắc, Quận Liên Chiểu',
    'Phường Hòa Hiệp Nam, Quận Liên Chiểu',
    'Phường Hòa Hiệp Bắc, Quận Liên Chiểu'
  ],
  'Cẩm Lệ': [
    'Phường Khuê Trung, Quận Cẩm Lệ',
    'Phường Hòa An, Quận Cẩm Lệ',
    'Phường Hòa Phát, Quận Cẩm Lệ',
    'Phường Hòa Thọ Đông, Quận Cẩm Lệ',
    'Phường Hòa Thọ Tây, Quận Cẩm Lệ',
    'Phường Hòa Xuân, Quận Cẩm Lệ'
  ]
};

const categories = ['Không nội thất', 'Nội thất cơ bản', 'Nội thất đầy đủ'];
const statusTypes = ['Ở đơn', 'Ở ghép'];

const categoryConfigs = {
  'Nội thất đầy đủ': {
    titles: [
      'Phòng trọ cao cấp full nội thất',
      'Phòng trọ khép kín đầy đủ tiện nghi',
      'Phòng trọ mới xây full tiện ích, xách vali vào ở',
      'Phòng trọ cao cấp đầy đủ điều hòa, tủ lạnh',
      'Dãy trọ vip khép kín đầy đủ nội thất'
    ],
    descriptions: [
      'Phòng trọ trang bị đầy đủ tiện nghi cao cấp: điều hòa, tủ lạnh, giường nệm, tủ quần áo lớn, máy nước nóng. Bạn chỉ cần xách vali vào ở ngay, không cần mua sắm gì thêm.',
      'Đầy đủ nội thất xịn: máy lạnh, tủ lạnh 2 cánh, tủ đồ, giường nệm mới 100%. Lối đi riêng biệt, không chung chủ, giờ giấc tự do.',
      'Trang bị đầy đủ tiện nghi hiện đại: tủ lạnh, máy điều hòa tiết kiệm điện, máy nước nóng, tủ quần áo, giường nệm cao cấp. Có chỗ để xe an ninh.'
    ],
    priceRange: { min: 3000000, max: 5000000 },
    depositRange: { min: 1500000, max: 2500000 }
  },
  'Nội thất cơ bản': {
    titles: [
      'Phòng trọ trang bị nội thất cơ bản',
      'Phòng trọ khép kín có sẵn giường tủ',
      'Phòng trọ sạch sẽ có kệ bếp và gác lửng',
      'Phòng trọ giá tốt có sẵn nội thất cơ bản',
      'Dãy trọ khép kín có sẵn giường tủ gỗ'
    ],
    descriptions: [
      'Phòng trọ khép kín rộng rãi, trang bị sẵn nội thất cơ bản gồm giường ngủ gỗ, tủ quần áo và kệ bếp nấu ăn. Thích hợp cho sinh viên hoặc người đi làm.',
      'Có sẵn giường, tủ đồ gỗ tiện lợi và kệ bếp nấu ăn khép kín. Phòng sạch sẽ thoáng mát, lối đi riêng lập và chỗ để xe máy an toàn.',
      'Trang bị sẵn các tiện nghi cơ bản như giường ngủ, tủ treo quần áo và khu vực bếp riêng. Chỉ cần mang đồ dùng cá nhân là vào ở được ngay.'
    ],
    priceRange: { min: 2000000, max: 3000000 },
    depositRange: { min: 1000000, max: 1500000 }
  },
  'Không nội thất': {
    titles: [
      'Phòng trọ trống sạch sẽ giá rẻ',
      'Phòng trọ không nội thất giờ giấc tự do',
      'Phòng trọ giá bình dân cho sinh viên',
      'Phòng trọ khép kín trống suốt giá tốt',
      'Dãy trọ giá rẻ cho sinh viên tự sắm đồ'
    ],
    descriptions: [
      'Phòng trọ trống sạch sẽ mới sơn sửa, khép kín, có gác lửng. Rất phù hợp cho các bạn sinh viên đã có sẵn đồ đạc cá nhân tự trang trí.',
      'Phòng trống khép kín không nội thất để bạn tự do bố trí theo sở thích. Giờ giấc tự do, có chỗ phơi đồ thoáng mát và chỗ để xe rộng rãi.',
      'Nhà trọ trống khép kín giá bình dân, sạch sẽ thoáng mát, an ninh tốt. Thích hợp cho hộ gia đình nhỏ hoặc nhóm sinh viên tự sắm đồ.'
    ],
    priceRange: { min: 1200000, max: 1900000 },
    depositRange: { min: 500000, max: 1000000 }
  }
};

const seedLandlords = [
  { username: 'ha_tran', phone: '0905111222' },
  { username: 'duy_do', phone: '0935333444' },
  { username: 'co_sau', phone: '0905666777' },
  { username: 'chu_bay', phone: '0945777888' },
  { username: 'lan_nguyen', phone: '0915999000' },
  { username: 'minh_pham', phone: '0905222333' },
  { username: 'anh_tuan', phone: '0985444555' },
  { username: 'thuy_hoang', phone: '0935666777' },
  { username: 'quoc_le', phone: '0905888999' },
  { username: 'kieu_oanh', phone: '0915111333' }
];

const seedTenants = [
  { username: 'hoang_nam', phone: '0935222111' },
  { username: 'linh_dan', phone: '0905444333' },
  { username: 'khanh_vy', phone: '0915555666' }
];

async function seed() {
  try {
    console.log('=== KHỞI ĐẦU QUÁ TRÌNH SEED DỮ LIỆU ===');

    // 1. Xóa phòng trọ cũ
    console.log('Đang lấy danh sách phòng trọ cũ...');
    const roomsRes = await axios.get(ROOMS_API_URL);
    console.log(`Tìm thấy ${roomsRes.data.length} phòng trọ cũ. Bắt đầu xóa...`);
    for (const r of roomsRes.data) {
      console.log(`Xóa phòng trọ ID: ${r.id}...`);
      await axios.delete(`${ROOMS_API_URL}/${r.id}`);
      await delay(100);
    }

    // 2. Xóa người dùng cũ (NGOẠI TRỪ các tài khoản ADMIN)
    console.log('Đang lấy danh sách người dùng cũ...');
    const usersRes = await axios.get(USERS_API_URL);
    console.log(`Tìm thấy ${usersRes.data.length} người dùng cũ.`);
    
    const existingAdmins = usersRes.data.filter(u => 
      String(u.role).toUpperCase() === 'ADMIN' || u.username === 'admin'
    );
    const adminUsernames = existingAdmins.map(a => a.username);
    console.log('Các tài khoản Admin được bảo vệ (không xóa):', adminUsernames);

    for (const u of usersRes.data) {
      if (String(u.role).toUpperCase() === 'ADMIN' || u.username === 'admin') {
        console.log(`-> Bỏ qua không xóa tài khoản Admin: ${u.username}`);
        continue;
      }
      console.log(`Xóa người dùng ID: ${u.id} (Username: ${u.username})...`);
      await axios.delete(`${USERS_API_URL}/${u.id}`);
      await delay(100);
    }

    console.log('Mã hóa mật khẩu cho người dùng seed...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminHashedPassword = await bcrypt.hash('admin123', 10);

    // 3. Tạo tài khoản Admin mặc định (chỉ tạo nếu hệ thống chưa có tài khoản admin nào tên "admin")
    const hasAdminNamedAdmin = usersRes.data.some(u => u.username === 'admin');
    if (!hasAdminNamedAdmin) {
      console.log('Không tìm thấy tài khoản "admin" nào. Tạo tài khoản Admin mặc định...');
      const adminUser = {
        username: 'admin',
        password: adminHashedPassword,
        phone: '0905000000',
        role: 'ADMIN',
        favorites: []
      };
      await axios.post(USERS_API_URL, adminUser);
      await delay(100);
    } else {
      console.log('Tài khoản "admin" đã tồn tại. Giữ nguyên tài khoản cũ.');
    }

    // 4. Tạo 10 tài khoản Chủ trọ (Landlord) thực tế
    const landlords = [];
    console.log('Bắt đầu tạo 10 tài khoản Chủ trọ thực tế...');
    for (const item of seedLandlords) {
      const landlord = {
        username: item.username,
        password: hashedPassword,
        phone: item.phone,
        role: 'LANDLORD',
        favorites: []
      };
      const response = await axios.post(USERS_API_URL, landlord);
      landlords.push(response.data);
      console.log(`Đã tạo thành công chủ trọ: ${landlord.username} (ID: ${response.data.id})`);
      await delay(100);
    }

    // 5. Tạo tài khoản Khách thuê (Tenant) thực tế
    console.log('Tạo 3 tài khoản Khách thuê thực tế...');
    for (const item of seedTenants) {
      const tenant = {
        username: item.username,
        password: hashedPassword,
        phone: item.phone,
        role: 'TENANT',
        favorites: []
      };
      await axios.post(USERS_API_URL, tenant);
      await delay(100);
    }

    // 6. Tạo phòng trọ ngẫu nhiên cho 10 chủ trọ
    console.log('Bắt đầu tạo phòng trọ ngẫu nhiên cho từng chủ trọ...');
    let totalRoomsCreated = 0;
    for (const host of landlords) {
      const numRooms = Math.floor(Math.random() * 3) + 1;
      console.log(`Chủ trọ ${host.username} (ID: ${host.id}) sẽ được tạo ${numRooms} bài đăng.`);

      for (let j = 1; j <= numRooms; j++) {
        const district = danangDistricts[Math.floor(Math.random() * danangDistricts.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
        
        const config = categoryConfigs[category];
        const titlePrefix = config.titles[Math.floor(Math.random() * config.titles.length)];
        const description = config.descriptions[Math.floor(Math.random() * config.descriptions.length)];
        
        const price = Math.floor(Math.random() * ((config.priceRange.max - config.priceRange.min) / 100000 + 1)) * 100000 + config.priceRange.min;
        const deposit = Math.floor(Math.random() * ((config.depositRange.max - config.depositRange.min) / 500000 + 1)) * 500000 + config.depositRange.min;
        
        // Chọn đường phố và phường thực tế tương ứng với quận đó
        const streets = districtStreets[district];
        const streetName = streets[Math.floor(Math.random() * streets.length)];
        const wards = districtWards[district];
        const wardName = wards[Math.floor(Math.random() * wards.length)];
        
        const alleyNo = Math.floor(Math.random() * 150) + 10;
        const subAlleyNo = Math.floor(Math.random() * 20) + 1;
        const address = `K${alleyNo}/${subAlleyNo} đường ${streetName}, ${wardName}, Đà Nẵng`;

        const area = Math.floor(Math.random() * 16) + 15;
        const shuffledImages = [...sampleImages].sort(() => 0.5 - Math.random());
        const images = shuffledImages.slice(0, Math.floor(Math.random() * 2) + 1);

        const amenityKeys = ['wifi', 'air_conditioner', 'parking', 'private_wc', 'washing_machine', 'kitchen', 'camera', 'elevator', 'pet_allowed', 'no_shared_owner', 'free_schedule'];
        const shuffledAmenities = [...amenityKeys].sort(() => 0.5 - Math.random());
        const randomAmenities = shuffledAmenities.slice(0, Math.floor(Math.random() * 5) + 2); // 2 to 6 amenities

        const room = {
          title: `${titlePrefix} quận ${district}`,
          area: area,
          status: status,
          category: category,
          price: price,
          address: address,
          description: description,
          deposit: deposit,
          phone: host.phone,
          host: {
            id: host.id,
            username: host.username,
            role: 'Chủ trọ'
          },
          images: images,
          amenities: randomAmenities,
          isAvailable: Math.random() > 0.15
        };

        await axios.post(ROOMS_API_URL, room);
        totalRoomsCreated++;
        console.log(`  -> Đã tạo bài đăng: "${room.title}" - Địa chỉ: "${room.address}"`);
        await delay(100);
      }
    }

    console.log('=== SEED DỮ LIỆU THÀNH CÔNG RỰC RỠ ===');
    console.log(`Đã tạo/giữ lại:`);
    console.log(` - Giữ lại ${existingAdmins.length} tài khoản Admin hiện có.`);
    console.log(` - 10 Chủ trọ thực tế (ha_tran, duy_do, co_sau, chu_bay... / password123)`);
    console.log(` - 3 Khách thuê thực tế (hoang_nam, linh_dan, khanh_vy / password123)`);
    console.log(` - Tổng cộng ${totalRoomsCreated} bài đăng phòng trọ.`);
  } catch (err) {
    console.error('LỖI KHI CHẠY SEED DỮ LIỆU:', err.message);
    if (err.response) {
      console.error('Chi tiết lỗi API:', err.response.data);
    }
  }
}

seed();
