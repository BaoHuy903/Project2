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
  sortBy: 'newest',
  showFavoritesOnly: false,
  favorites: []
};

// Formatting posting time helper
function formatTimeSince(dateString) {
  if (!dateString || dateString === 'undefined') return 'Vừa xong';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Vừa xong';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  
  return 'Đăng ngày ' + date.toLocaleDateString('vi-VN');
}

// Get user-specific key for favorites
const getFavKey = () => {
  const userId = typeof LOGGED_IN_USER_ID !== 'undefined' ? LOGGED_IN_USER_ID : '';
  return userId ? `favRoomIds_${userId}` : 'favRoomIds_guest';
};

// Load favorites
document.addEventListener('DOMContentLoaded', () => {
  const userId = typeof LOGGED_IN_USER_ID !== 'undefined' ? LOGGED_IN_USER_ID : '';
  if (userId) {
    state.favorites = typeof INITIAL_FAVORITES !== 'undefined' ? INITIAL_FAVORITES : [];
  } else {
    const stored = localStorage.getItem(getFavKey());
    if (stored) {
      state.favorites = JSON.parse(stored);
    }
  }
  updateHeartIcons();
  
  // Format initial posting times
  document.querySelectorAll('.posting-time-el').forEach(el => {
    const created = el.getAttribute('data-created');
    el.textContent = formatTimeSince(created);
  });

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
  
  const userId = typeof LOGGED_IN_USER_ID !== 'undefined' ? LOGGED_IN_USER_ID : '';
  const index = state.favorites.indexOf(id);
  const isAdding = index === -1;
  let msg = '';
  
  if (userId) {
    // Logged in: Sync with database via API
    fetch('/users/favorites/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomId: id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        state.favorites = data.favorites;
        updateHeartIcons();
        showFavToast(isAdding ? 'Đã lưu tin đăng phòng trọ!' : 'Đã xóa tin khỏi danh sách lưu!');
        if (state.showFavoritesOnly) {
          filterRooms();
        }
      } else {
        alert('Lỗi cập nhật yêu thích: ' + data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    });
  } else {
    // Guest: use local storage
    if (isAdding) {
      state.favorites.push(id);
      msg = 'Đã lưu tin đăng phòng trọ!';
    } else {
      state.favorites.splice(index, 1);
      msg = 'Đã xóa tin khỏi danh sách lưu!';
    }
    
    localStorage.setItem(getFavKey(), JSON.stringify(state.favorites));
    updateHeartIcons();
    showFavToast(msg);
    
    if (state.showFavoritesOnly) {
      filterRooms();
    }
  }
}

function showFavToast(msg) {
  const toastEl = document.getElementById('favToast');
  if (toastEl) {
    const bodyEl = document.getElementById('favToastBody');
    if (bodyEl) bodyEl.textContent = msg;
    const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
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
  
  // Sort room cards based on the selected criteria
  sortRooms();
}

// Modal details triggers
function handleCardClick(event, element) {
  // Ignore click if user is selecting/highlighting text
  if (window.getSelection() && window.getSelection().toString().trim() !== '') {
    return;
  }

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
  
  const timeEl = document.getElementById('detailPostingTime');
  if (timeEl) {
    timeEl.innerHTML = `<i class="bi bi-clock me-1"></i>${getRelativeTime(room.createdAt)}`;
  }

  const detailFavBtn = document.getElementById('detailFavBtn');
  if (detailFavBtn) {
    detailFavBtn.setAttribute('data-fav-id', room.id);
    detailFavBtn.setAttribute('onclick', `toggleFavorite(event, '${room.id}')`);
  }
  updateHeartIcons();
  
  const priceText = room.price ? (room.price / 1000000).toLocaleString('vi-VN') + ' triệu/tháng' : 'Thỏa thuận';
  document.getElementById('detailPrice').textContent = priceText;
  
  const depositBadge = document.getElementById('detailDepositBadge');
  if (room.deposit) {
    depositBadge.style.display = 'inline-flex';
    document.getElementById('detailDeposit').textContent = room.deposit.toLocaleString('vi-VN');
  } else {
    depositBadge.style.display = 'none';
  }

  // Populate new rules and utility costs
  document.getElementById('detailDepositMonth').textContent = room.depositMonth !== undefined && room.depositMonth !== null ? `${room.depositMonth} tháng` : 'Chưa cập nhật';
  document.getElementById('detailPaymentCycle').textContent = room.paymentCycle || 'Chưa cập nhật';
  document.getElementById('detailParking').textContent = room.parking || 'Chưa cập nhật';
  document.getElementById('detailElectricity').textContent = room.electricityPrice !== undefined && room.electricityPrice !== null ? `${room.electricityPrice.toLocaleString('vi-VN')} đ/kWh` : 'Chưa cập nhật';
  document.getElementById('detailWater').textContent = room.waterPrice !== undefined && room.waterPrice !== null ? `${room.waterPrice.toLocaleString('vi-VN')} đ/m³` : 'Chưa cập nhật';

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

  const detailPostingTime = document.getElementById('detailPostingTime');
  if (detailPostingTime) {
    detailPostingTime.innerHTML = `<i class="bi bi-clock me-1"></i>${formatTimeSince(room.createdAt)}`;
  }

  document.getElementById('detailHostName').textContent = hostName;
  document.getElementById('detailHostRole').textContent = hostRole;
  document.getElementById('detailPhone').textContent = contactPhone;

  document.getElementById('btnCallHost').href = `tel:${contactPhone}`;
  document.getElementById('btnZaloHost').href = `https://zalo.me/${contactPhone}`;

  // Open Modal
  const modal = new bootstrap.Modal(document.getElementById('roomDetailModal'));
  modal.show();
}

// Sorting logic
function setSort(type) {
  state.sortBy = type;
  
  // Update dropdown button text
  const btn = document.getElementById('sortByBtn');
  if (btn) {
    let text = 'Tin mới nhất';
    if (type === 'price-asc') text = 'Giá thấp trước';
    if (type === 'price-desc') text = 'Giá cao trước';
    btn.textContent = text;
  }

  // Update checkmarks in dropdown menu
  const options = ['newest', 'price-asc', 'price-desc'];
  options.forEach(opt => {
    const el = document.getElementById(`sort-${opt}`);
    if (el) {
      const check = el.querySelector('i');
      if (opt === type) {
        el.classList.add('active');
        if (check) check.classList.remove('d-none');
      } else {
        el.classList.remove('active');
        if (check) check.classList.add('d-none');
      }
    }
  });

  // Trigger filter which will execute sortRooms internally
  filterRooms();
}

function sortRooms() {
  const container = document.getElementById('roomsContainer');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.room-card'));
  
  cards.sort((a, b) => {
    if (state.sortBy === 'price-asc') {
      const priceA = Number(a.getAttribute('data-price')) || 0;
      const priceB = Number(b.getAttribute('data-price')) || 0;
      return priceA - priceB;
    } else if (state.sortBy === 'price-desc') {
      const priceA = Number(a.getAttribute('data-price')) || 0;
      const priceB = Number(b.getAttribute('data-price')) || 0;
      return priceB - priceA;
    } else {
      // newest
      const timeA = a.getAttribute('data-created-at') || '';
      const timeB = b.getAttribute('data-created-at') || '';
      if (timeA && timeB && timeA !== 'undefined' && timeB !== 'undefined') {
        return new Date(timeB) - new Date(timeA); // Newest first
      }
      const idA = Number(a.getAttribute('data-id')) || 0;
      const idB = Number(b.getAttribute('data-id')) || 0;
      return idB - idA; // Fallback to higher ID first
    }
  });

  // Re-append sorted elements
  cards.forEach(card => {
    if (card.id !== 'emptyPlaceholder') {
      container.appendChild(card);
    }
  });
}

// Helper to format relative time for room postings
function getRelativeTime(dateString) {
  if (!dateString) return 'Vừa xong';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  
  if (isNaN(diffMs) || diffMs < 0) return 'Vừa xong';
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  
  if (diffSec < 60) {
    return 'Vừa xong';
  } else if (diffMin < 60) {
    return `${diffMin} phút trước`;
  } else if (diffHr < 24) {
    return `${diffHr} giờ trước`;
  } else if (diffDay < 30) {
    return `${diffDay} ngày trước`;
  } else {
    const d = past.getDate().toString().padStart(2, '0');
    const m = (past.getMonth() + 1).toString().padStart(2, '0');
    const y = past.getFullYear();
    return `${d}/${m}/${y}`;
  }
}

