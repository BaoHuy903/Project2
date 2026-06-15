const state = {
  filters: {
    location: 'Tất cả',
    status: 'Tất cả',
    price: 'Tất cả',
    area: 'Tất cả',
    category: 'Tất cả',
    search: '',
    amenities: []
  },
  sortBy: 'newest',
  showFavoritesOnly: false,
  favorites: [],
  currentPage: 1,
  pageSize: 8
};

const formatTimeSince = (dateString) => {
  if (!dateString || dateString === 'undefined') return 'Vừa xong';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return `Đăng ngày ${new Date(dateString).toLocaleDateString('vi-VN')}`;
};

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
      try { state.favorites = JSON.parse(stored); } catch(e) { state.favorites = []; }
    }
  }
  updateHeartIcons();
  
  // Format initial posting times
  document.querySelectorAll('.posting-time-el').forEach(el => {
    const created = el.getAttribute('data-created');
    el.textContent = formatTimeSince(created);
  });

  // Apply pre-filters from URL (e.g. landing page quick filter chips)
  if (typeof PRE_FILTER !== 'undefined') {
    if (PRE_FILTER.district && PRE_FILTER.district.trim() !== '') {
      setFilter('location', PRE_FILTER.district.trim());
    }
    if (PRE_FILTER.q && PRE_FILTER.q.trim() !== '') {
      state.filters.search = PRE_FILTER.q.toLowerCase().trim();
      if (searchInput) searchInput.value = PRE_FILTER.q;
      if (mobileSearchInput) mobileSearchInput.value = PRE_FILTER.q;
    }
  }

  filterRooms();

  // Open modal if room query parameter is present (supports clicking from Landing Page)
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('room') || params.get('id');
  if (roomId) {
    // If the room might be on another page, let's find the card
    const card = document.querySelector(`.room-card[data-id="${roomId}"]`);
    if (card) {
      setTimeout(() => {
        card.click();
      }, 150);
    }
  }

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

const updateHeartIcons = () => {
  document.querySelectorAll('.btn-fav-toggle').forEach(btn => {
    const id = btn.getAttribute('data-fav-id');
    const icon = btn.querySelector('i');
    icon.className = state.favorites.includes(id) ? 'bi bi-heart-fill fav-active' : 'bi bi-heart text-secondary';
  });
  
  const navBtn = document.getElementById('favNavBtn');
  if (navBtn) {
    navBtn.classList.toggle('fav-nav-active', state.showFavoritesOnly);
  }
};

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
  state.currentPage = 1;
  updateHeartIcons();
  filterRooms();
}

// Search input listeners
const searchInput = document.getElementById('searchInput');
const mobileSearchInput = document.getElementById('mobileSearchInput');

const handleSearchInput = (e) => {
  state.filters.search = e.target.value.toLowerCase().trim();
  state.currentPage = 1;
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
    let icon = '';
    if (type === 'location') icon = '<i class="bi bi-geo-alt"></i> ';
    if (type === 'status') icon = '<i class="bi bi-door-open"></i> ';
    if (type === 'price') icon = '<i class="bi bi-cash"></i> ';
    if (type === 'area') icon = '<i class="bi bi-rulers"></i> ';
    if (type === 'category') icon = '<i class="bi bi-lamp"></i> ';
    btn.innerHTML = `${icon}${value !== 'Tất cả' ? value : (['location'].includes(type) ? 'Khu vực' : type === 'status' ? 'Loại phòng' : type === 'price' ? 'Giá thuê' : type === 'area' ? 'Diện tích' : 'Nội thất')}`;
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
  
  state.currentPage = 1;
  filterRooms();
}

// Toggle amenity filter
function toggleAmenityFilter(btn, key) {
  const index = state.filters.amenities.indexOf(key);
  if (index === -1) {
    state.filters.amenities.push(key);
    btn.classList.add('active');
  } else {
    state.filters.amenities.splice(index, 1);
    btn.classList.remove('active');
  }
  state.currentPage = 1;
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
    search: '',
    amenities: []
  };
  state.showFavoritesOnly = false;
  
  if (searchInput) searchInput.value = '';
  if (mobileSearchInput) mobileSearchInput.value = '';

  const locBtn = document.getElementById('btnFilterLocation');
  const statBtn = document.getElementById('btnFilterStatus');
  const priceBtn = document.getElementById('btnFilterPrice');
  const areaBtn = document.getElementById('btnFilterArea');
  const catBtn = document.getElementById('btnFilterCategory');

  if (locBtn) locBtn.innerHTML = '<i class="bi bi-geo-alt"></i> Khu vực';
  if (statBtn) statBtn.innerHTML = '<i class="bi bi-door-open"></i> Loại phòng';
  if (priceBtn) priceBtn.innerHTML = '<i class="bi bi-cash"></i> Giá thuê';
  if (areaBtn) areaBtn.innerHTML = '<i class="bi bi-rulers"></i> Diện tích';
  if (catBtn) catBtn.innerHTML = '<i class="bi bi-lamp"></i> Nội thất';

  document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tv-amenity-filters .amenity-chip').forEach(btn => btn.classList.remove('active'));
  const resetBtn = document.getElementById('filterResetBtn');
  if (resetBtn) resetBtn.classList.add('active');

  state.currentPage = 1;
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

    const cardAmenitiesStr = card.getAttribute('data-amenities') || '';
    const cardAmenities = cardAmenitiesStr ? cardAmenitiesStr.split(',') : [];

    let isMatch = true;

    // Amenities Filter
    if (state.filters.amenities.length > 0) {
      const matchesAllAmenities = state.filters.amenities.every(amenity => cardAmenities.includes(amenity));
      if (!matchesAllAmenities) {
        isMatch = false;
      }
    }

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
    if (state.filters.category !== 'Tất cả') {
      const filterVal = state.filters.category === 'Nhà trống' ? 'Không nội thất' : state.filters.category;
      const cardVal = category === 'Nhà trống' ? 'Không nội thất' : category;
      if (cardVal !== filterVal) {
        isMatch = false;
      }
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
      card.dataset.matched = "true";
      visibleCount++;
    } else {
      card.dataset.matched = "false";
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

  // Update room count in hero banner
  const statRoomCount = document.getElementById('statRoomCount');
  if (statRoomCount) {
    statRoomCount.textContent = visibleCount;
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
    timeEl.innerHTML = `<i class="bi bi-clock me-1"></i>${formatTimeSince(room.createdAt)}`;
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
  const availableFromEl = document.getElementById('detailAvailableFrom');
  if (availableFromEl) {
    if (room.availableFrom) {
      const d = new Date(room.availableFrom);
      availableFromEl.textContent = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else {
      availableFromEl.textContent = 'Chưa cập nhật';
    }
  }
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

  document.getElementById('detailHostName').textContent = hostName;
  document.getElementById('detailHostRole').textContent = hostRole;
  document.getElementById('detailPhone').textContent = contactPhone;

  document.getElementById('btnCallHost').href = `tel:${contactPhone}`;
  document.getElementById('btnZaloHost').href = `https://zalo.me/${contactPhone}`;

  // Populate Amenities
  const detailAmenitiesContainer = document.getElementById('detailAmenities');
  const detailAmenitiesList = document.getElementById('detailAmenitiesList');
  if (detailAmenitiesContainer && detailAmenitiesList) {
    detailAmenitiesList.innerHTML = '';
    if (room.amenities && room.amenities.length > 0 && typeof AMENITIES_DATA !== 'undefined') {
      detailAmenitiesContainer.style.display = 'block';
      room.amenities.forEach(ak => {
        const found = AMENITIES_DATA.find(a => a.key === ak);
        if (found) {
          const item = document.createElement('div');
          item.className = 'tv-amenity-detail-item';
          item.innerHTML = `<i class="bi ${found.icon}"></i> <span>${found.label}</span>`;
          detailAmenitiesList.appendChild(item);
        }
      });
    } else {
      detailAmenitiesContainer.style.display = 'none';
    }
  }

  // Open Modal
  const modal = new bootstrap.Modal(document.getElementById('roomDetailModal'));
  modal.show();
}

// Sorting logic
function setSort(type) {
  state.sortBy = type;
  state.currentPage = 1;
  
  // Update dropdown button text
  const btn = document.getElementById('sortByBtn');
  if (btn) {
    let text = 'Tin mới nhất';
    if (type === 'price-asc') text = 'Giá Thấp - Cao';
    if (type === 'price-desc') text = 'Giá Cao - Thấp';
    btn.innerHTML = `<i class="bi bi-arrow-down-up"></i> ${text}`;
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

  // Apply Client-Side Pagination
  const matchedCards = cards.filter(card => card.dataset.matched === "true");
  const totalMatched = matchedCards.length;
  
  matchedCards.forEach((card, index) => {
    const isWithinPage = index >= (state.currentPage - 1) * state.pageSize && index < state.currentPage * state.pageSize;
    if (isWithinPage) {
      card.style.setProperty('display', 'flex', 'important');
    } else {
      card.style.setProperty('display', 'none', 'important');
    }
  });

  // Hide non-matched cards just to be sure
  cards.forEach(card => {
    if (card.dataset.matched === "false") {
      card.style.setProperty('display', 'none', 'important');
    }
  });

  // Render pagination controls
  updatePagination(totalMatched);
}

// Generate pagination controls
function updatePagination(totalItems) {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  container.innerHTML = '';

  const totalPages = Math.ceil(totalItems / state.pageSize);
  if (totalPages <= 1) {
    return; // No pagination UI needed for 0 or 1 page
  }

  // Previous Page Button
  const prevBtn = document.createElement('button');
  prevBtn.className = `page-btn ${state.currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = '« Trang trước';
  if (state.currentPage > 1) {
    prevBtn.onclick = () => {
      state.currentPage--;
      filterRooms();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
  container.appendChild(prevBtn);

  // Page Numbers
  const maxButtons = 5;
  let startPage = Math.max(1, state.currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  if (startPage > 1) {
    const firstBtn = document.createElement('button');
    firstBtn.className = `page-btn ${state.currentPage === 1 ? 'active' : ''}`;
    firstBtn.textContent = '1';
    firstBtn.onclick = () => {
      state.currentPage = 1;
      filterRooms();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    container.appendChild(firstBtn);

    if (startPage > 2) {
      const dots = document.createElement('span');
      dots.className = 'px-2 text-muted';
      dots.textContent = '...';
      container.appendChild(dots);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${state.currentPage === i ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      state.currentPage = i;
      filterRooms();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    container.appendChild(pageBtn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement('span');
      dots.className = 'px-2 text-muted';
      dots.textContent = '...';
      container.appendChild(dots);
    }

    const lastBtn = document.createElement('button');
    lastBtn.className = `page-btn ${state.currentPage === totalPages ? 'active' : ''}`;
    lastBtn.textContent = totalPages;
    lastBtn.onclick = () => {
      state.currentPage = totalPages;
      filterRooms();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    container.appendChild(lastBtn);
  }

  // Next Page Button
  const nextBtn = document.createElement('button');
  nextBtn.className = `page-btn ${state.currentPage === totalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = 'Trang sau »';
  if (state.currentPage < totalPages) {
    nextBtn.onclick = () => {
      state.currentPage++;
      filterRooms();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
  container.appendChild(nextBtn);
}

