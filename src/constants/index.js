const ROLES = {
  TENANT: 'TENANT',
  LANDLORD: 'LANDLORD',
  ADMIN: 'ADMIN'
};

const DEFAULT_HOTLINE = '0704699523';

const ROOM_STATUS_TYPES = ['Ở đơn', 'Ở ghép'];

// Danh sách tiện ích chuẩn
const AMENITIES = [
  { key: 'wifi', label: 'Wifi', icon: 'bi-wifi' },
  { key: 'air_conditioner', label: 'Máy lạnh', icon: 'bi-snow' },
  { key: 'parking', label: 'Chỗ để xe', icon: 'bi-p-circle' },
  { key: 'private_wc', label: 'WC riêng', icon: 'bi-droplet-half' },
  { key: 'washing_machine', label: 'Máy giặt', icon: 'bi-cup-straw' },
  { key: 'kitchen', label: 'Bếp riêng', icon: 'bi-fire' },
  { key: 'camera', label: 'Camera', icon: 'bi-camera-video' },
  { key: 'elevator', label: 'Thang máy', icon: 'bi-arrow-up-square' },
  { key: 'pet_allowed', label: 'Cho nuôi thú cưng', icon: 'bi-emoji-heart-eyes' },
  { key: 'no_shared_owner', label: 'Không chung chủ', icon: 'bi-house-check' },
  { key: 'free_schedule', label: 'Giờ giấc tự do', icon: 'bi-clock-history' }
];

module.exports = {
  ROLES,
  DEFAULT_HOTLINE,
  ROOM_STATUS_TYPES,
  AMENITIES
};
