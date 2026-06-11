// State management
const state = {
  filters: {
    location: 'Tất cả',
    status: 'Tất cả',
    price: 'Tất cả',
    area: 'Tất cả',
    category: 'Tất cả',
    search: ''
  },
  showFavoritesOnly: false,
  favorites: []
};

// Load favorites from local storage
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('favRoomIds');
  if (stored) {
    state.favorites = JSON.parse(stored);
  }
  updateHeartIcons();
  filterRooms();

  // Synchronize thumbnail active state with carousel sliding
  const carouselEl = document.getElementById('detailCarousel');
  if (carouselEl) {
    carouselEl.addEventListener('slide.bs.carousel', event => {
      const activeIndex = event.to;
      const thumbnailsContainer = document.getElementById('carouselThumbnails');
      if (thumbnailsContainer) {
        const thumbs = thumbnailsContainer.querySelectorAll('.thumbnail-item');
        thumbs.forEach((thumb, idx) => {
          if (idx === activeIndex) {
            thumb.classList.add('active');
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } else {
            thumb.classList.remove('active');
          }
        });
      }
    });
  }
});

// Handle heart icon states
function updateHeartIcons() {
  document.querySelectorAll('.btn-fav-toggle').forEach(btn => {
    const id = btn.getAttribute('data-fav-id');
    const icon = btn.querySelector('i');
    if (state.favorites.includes(id)) {
      icon.className = 'bi bi-heart-fill fav-active';
    } else {
      icon.className = 'bi bi-heart text-secondary';
    }
  });
  // Update navbar heart button state
  const navBtn = document.getElementById('favNavBtn');
  if (navBtn) {
    if (state.showFavoritesOnly) {
      navBtn.classList.add('fav-nav-active');
    } else {
      navBtn.classList.remove('fav-nav-active');
    }
  }
}

// Toggle favorites array
function toggleFavorite(event, id) {
  event.stopPropagation(); // Prevent opening detail modal
  
  const index = state.favorites.indexOf(id);
  let msg = '';
  if (index === -1) {
    state.favorites.push(id);
    msg = 'Đã lưu tin đăng phòng trọ!';
  } else {
    state.favorites.splice(index, 1);
    msg = 'Đã xóa tin khỏi danh sách lưu!';
  }
  
  localStorage.setItem('favRoomIds', JSON.stringify(state.favorites));
  updateHeartIcons();
  showFavToast(msg);
  
  if (state.showFavoritesOnly) {
    filterRooms();
  }
}

function showFavToast(msg) {
  const toastEl = document.getElementById('favToast');
  if (toastEl) {
    const bodyEl = document.getElementById('favToastBody');
    if (bodyEl) bodyEl.textContent = msg;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

function toggleFavoritesOnly() {
  state.showFavoritesOnly = !state.showFavoritesOnly;
  updateHeartIcons();
  filterRooms();
}

// Search input listeners
const searchInput = document.getElementById('searchInput');
const mobileSearchInput = document.getElementById('mobileSearchInput');

const handleSearchInput = (e) => {
  state.filters.search = e.target.value.toLowerCase().trim();
  filterRooms();
};

if (searchInput) searchInput.addEventListener('input', handleSearchInput);
if (mobileSearchInput) mobileSearchInput.addEventListener('input', handleSearchInput);

// Dropdown filters handler
function setFilter(type, value) {
  state.filters[type] = value;
  
  // Update dropdown button label
  const btn = document.getElementById(
    type === 'location' ? 'btnFilterLocation' :
    type === 'status' ? 'btnFilterStatus' :
    type === 'price' ? 'btnFilterPrice' :
    type === 'area' ? 'btnFilterArea' : 'btnFilterCategory'
  );
  
  if (btn) {
    let prefix = '';
    if (type === 'location') prefix = 'Địa điểm';
    if (type === 'status') prefix = 'Loại phòng';
    if (type === 'price') prefix = 'Giá thuê';
    if (type === 'area') prefix = 'Diện tích';
    if (type === 'category') prefix = 'Nội thất';

    btn.textContent = `${prefix}: ${value}`;
    if (value !== 'Tất cả') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  // De-active reset filter button if any filter is set
  const resetBtn = document.getElementById('filterResetBtn');
  if (resetBtn) {
    const isAnyFilterActive = Object.keys(state.filters).some(key => key !== 'search' && state.filters[key] !== 'Tất cả');
    if (isAnyFilterActive) {
      resetBtn.classList.remove('active');
    } else {
      resetBtn.classList.add('active');
    }
  }
  
  filterRooms();
}

// Reset filters
function resetAllFilters() {
  state.filters = {
    location: 'Tất cả',
    status: 'Tất cả',
    price: 'Tất cả',
    area: 'Tất cả',
    category: 'Tất cả',
    search: ''
  };
  state.showFavoritesOnly = false;
  
  if (searchInput) searchInput.value = '';
  if (mobileSearchInput) mobileSearchInput.value = '';

  const locBtn = document.getElementById('btnFilterLocation');
  const statBtn = document.getElementById('btnFilterStatus');
  const priceBtn = document.getElementById('btnFilterPrice');
  const areaBtn = document.getElementById('btnFilterArea');
  const catBtn = document.getElementById('btnFilterCategory');

  if (locBtn) locBtn.textContent = 'Địa điểm: Tất cả';
  if (statBtn) statBtn.textContent = 'Loại phòng: Tất cả';
  if (priceBtn) priceBtn.textContent = 'Giá thuê: Tất cả';
  if (areaBtn) areaBtn.textContent = 'Diện tích: Tất cả';
  if (catBtn) catBtn.textContent = 'Nội thất: Tất cả';

  document.querySelectorAll('.filter-bar button').forEach(btn => btn.classList.remove('active'));
  const resetBtn = document.getElementById('filterResetBtn');
  if (resetBtn) resetBtn.classList.add('active');

  updateHeartIcons();
  filterRooms();
}

// MAIN FILTERING ENGINE
function filterRooms() {
  const cards = document.querySelectorAll('.room-card');
  let visibleCount = 0;
  
  cards.forEach(card => {
    const id = card.getAttribute('data-id');
    const title = card.getAttribute('data-title').toLowerCase();
    const address = card.getAttribute('data-address').toLowerCase();
    const price = Number(card.getAttribute('data-price'));
    const area = Number(card.getAttribute('data-area'));
    const category = card.getAttribute('data-category');
    const status = card.getAttribute('data-status');

    let isMatch = true;

    // Search Filter
    if (state.filters.search && !title.includes(state.filters.search) && !address.includes(state.filters.search)) {
      isMatch = false;
    }

    // Favorites Filter
    if (state.showFavoritesOnly && !state.favorites.includes(id)) {
      isMatch = false;
    }

    // Location Filter
    if (state.filters.location !== 'Tất cả' && !address.includes(state.filters.location.toLowerCase())) {
      isMatch = false;
    }

    // Status Filter (Ở đơn vs Ở ghép)
    if (state.filters.status !== 'Tất cả' && status !== state.filters.status) {
      isMatch = false;
    }

    // Category Filter (Nội thất)
    if (state.filters.category !== 'Tất cả' && category !== state.filters.category) {
      isMatch = false;
    }

    // Price Filter
    if (state.filters.price !== 'Tất cả') {
      if (state.filters.price === '<2M' && price >= 2000000) isMatch = false;
      if (state.filters.price === '2M-3M' && (price < 2000000 || price > 3000000)) isMatch = false;
      if (state.filters.price === '3M-5M' && (price < 3000000 || price > 5000000)) isMatch = false;
      if (state.filters.price === '>5M' && price <= 5000000) isMatch = false;
    }

    // Area Filter
    if (state.filters.area !== 'Tất cả') {
      if (state.filters.area === '<20' && area >= 20) isMatch = false;
      if (state.filters.area === '20-30' && (area < 20 || area > 30)) isMatch = false;
      if (state.filters.area === '>30' && area <= 30) isMatch = false;
    }

    if (isMatch) {
      card.style.setProperty('display', 'flex', 'important');
      visibleCount++;
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });

  // Handle empty placeholder visibility
  const placeholder = document.getElementById('emptyPlaceholder');
  if (placeholder) {
    if (visibleCount === 0) {
      placeholder.style.display = 'block';
    } else {
      placeholder.style.display = 'none';
    }
  }
}

// Modal details triggers
function handleCardClick(event, element) {
  // Ignore click if user is clicking on favorite heart button
  if (event.target.closest('.btn-fav-toggle')) {
    return;
  }
  
  const rawRoom = element.getAttribute('data-room');
  const room = JSON.parse(decodeURIComponent(rawRoom));
  
  // Populate text details
  document.getElementById('detailTitle').textContent = room.title;
  document.getElementById('detailAddress').textContent = room.address;
  document.getElementById('detailCategory').textContent = room.category || 'Nội thất cơ bản';
  document.getElementById('detailStatus').textContent = room.status || 'Ở đơn';
  document.getElementById('detailArea').textContent = room.area || 0;
  document.getElementById('detailDescription').textContent = room.description || '';
  
  const priceText = room.price ? (room.price / 1000000).toLocaleString('vi-VN') + ' triệu/tháng' : 'Thỏa thuận';
  document.getElementById('detailPrice').textContent = priceText;
  
  const depositBadge = document.getElementById('detailDepositBadge');
  if (room.deposit) {
    depositBadge.style.display = 'inline-flex';
    document.getElementById('detailDeposit').textContent = room.deposit.toLocaleString('vi-VN');
  } else {
    depositBadge.style.display = 'none';
  }

  // Availability badge
  const statusBadge = document.getElementById('detailBadgeStatus');
  if (statusBadge) {
    if (room.isAvailable !== false) {
      statusBadge.textContent = 'Còn trống';
      statusBadge.className = 'badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small mb-2 d-inline-block';
    } else {
      statusBadge.textContent = 'Đã thuê';
      statusBadge.className = 'badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 small mb-2 d-inline-block';
    }
  }

  // Populate Images Carousel
  const carouselInner = document.getElementById('carouselInner');
  if (carouselInner) {
    carouselInner.innerHTML = '';
    
    const thumbnailsContainer = document.getElementById('carouselThumbnails');
    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = '';
    }
    
    const images = room.images && room.images.length > 0 ? room.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&h=500&q=80'];
    
    if (thumbnailsContainer) {
      if (images.length > 1) {
        thumbnailsContainer.style.setProperty('display', 'flex', 'important');
      } else {
        thumbnailsContainer.style.setProperty('display', 'none', 'important');
      }
    }
    
    images.forEach((imgUrl, i) => {
      const item = document.createElement('div');
      item.className = `carousel-item ${i === 0 ? 'active' : ''}`;
      
      const img = document.createElement('img');
      img.src = imgUrl;
      img.className = 'd-block w-100';
      img.alt = `Room image ${i + 1}`;
      
      item.appendChild(img);
      carouselInner.appendChild(item);

      // Populate Thumbnail
      if (thumbnailsContainer && images.length > 1) {
        const thumbImg = document.createElement('img');
        thumbImg.src = imgUrl;
        thumbImg.className = `thumbnail-item ${i === 0 ? 'active' : ''}`;
        thumbImg.alt = `Thumbnail ${i + 1}`;
        
        thumbImg.addEventListener('click', () => {
          const carouselInstance = bootstrap.Carousel.getOrCreateInstance(document.getElementById('detailCarousel'));
          carouselInstance.to(i);
        });
        
        thumbnailsContainer.appendChild(thumbImg);
      }
    });
  }

  // Populate host name, role and contact phone number
  const hostName = room.host && room.host.username ? room.host.username : 'Ẩn danh';
  const hostRole = room.host && room.host.role ? room.host.role : 'Cá nhân';
  const contactPhone = room.phone || '0905123456';

  document.getElementById('detailHostName').textContent = hostName;
  document.getElementById('detailHostRole').textContent = hostRole;
  document.getElementById('detailPhone').textContent = contactPhone;

  document.getElementById('btnCallHost').href = `tel:${contactPhone}`;
  document.getElementById('btnZaloHost').href = `https://zalo.me/${contactPhone}`;

  // Open Modal
  const modal = new bootstrap.Modal(document.getElementById('roomDetailModal'));
  modal.show();
}
