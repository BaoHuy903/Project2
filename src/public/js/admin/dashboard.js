let deleteCallback = null;
let currentRoomPage = 1;
let currentUserPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      deleteCallback?.();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')).hide();
    });
  }

  const tabButtons = document.querySelectorAll('.db-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show', 'active'));
      
      btn.classList.add('active');
      const targetPane = document.querySelector(btn.getAttribute('data-bs-target'));
      if (targetPane) targetPane.classList.add('show', 'active');
    });
  });

  filterDashboardRooms();
  filterUsers();
});

const confirmAction = (title, message, callback) => {
  document.getElementById('confirmDeleteTitle').textContent = title;
  document.getElementById('confirmDeleteMessage').textContent = message;
  deleteCallback = callback;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')).show();
};

const deleteUser = (id, username) => {
  confirmAction(
    'Xác nhận xóa tài khoản',
    `Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Hành động này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ bị xóa bỏ.`,
    async () => {
      try {
        const response = await fetch(`/admin/users/${id}`, { method: 'DELETE' });
        const result = await response.json();
        showToast(result.message, result.success);
        if (result.success) document.getElementById(`user-row-${id}`)?.remove();
      } catch (err) {
        showToast('Có lỗi xảy ra kết nối máy chủ.', false);
      }
    }
  );
};

const deleteRoom = (id) => {
  confirmAction(
    'Xác nhận xóa phòng trọ',
    'Bạn có chắc chắn muốn xóa tin đăng phòng trọ này không? Hành động này không thể hoàn tác.',
    async () => {
      try {
        const response = await fetch(`/admin/rooms/${id}`, { method: 'DELETE' });
        const result = await response.json();
        showToast(result.message, result.success);
        if (result.success) {
          document.getElementById(`room-row-${id}`)?.remove();
          document.getElementById(`modal-room-row-${id}`)?.remove();
          if (typeof allRooms !== 'undefined') {
            const index = allRooms.findIndex(r => String(r.id) === String(id));
            if (index > -1) allRooms.splice(index, 1);
          }
        }
      } catch (err) {
        showToast('Có lỗi xảy ra kết nối máy chủ.', false);
      }
    }
  );
};

const toggleRoomStatus = async (id) => {
  const badge = document.getElementById(`room-badge-${id}`);
  const modalBadge = document.getElementById(`modal-room-badge-${id}`);
  const buttons = document.querySelectorAll(`#room-row-${id} .btn-action-toggle, #modal-room-row-${id} .btn-action-toggle`);

  const loadingHtml = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Đang lưu...`;
  if (badge) { badge.style.opacity = '0.6'; badge.innerHTML = loadingHtml; }
  if (modalBadge) { modalBadge.style.opacity = '0.6'; modalBadge.innerHTML = loadingHtml; }
  buttons.forEach(btn => btn.disabled = true);

  try {
    const response = await fetch(`/admin/rooms/${id}/status`, { method: 'PATCH' });
    const result = await response.json();
    showToast(result.message, result.success);

    if (result.success) {
      const text = result.isAvailable ? 'Còn trống' : 'Đã thuê';
      const className = result.isAvailable ? 'badge-status-empty' : 'badge-status-rented';
      if (badge) { badge.textContent = text; badge.className = className; badge.removeAttribute('style'); }
      if (modalBadge) { modalBadge.textContent = text; modalBadge.className = className; modalBadge.removeAttribute('style'); }
      if (typeof allRooms !== 'undefined') {
        const room = allRooms.find(r => String(r.id) === String(id));
        if (room) room.isAvailable = result.isAvailable;
      }
    } else {
      badge?.removeAttribute('style');
      modalBadge?.removeAttribute('style');
    }
  } catch (err) {
    showToast('Có lỗi xảy ra kết nối máy chủ.', false);
    badge?.removeAttribute('style');
    modalBadge?.removeAttribute('style');
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
};

// CLIENT-SIDE FILTER BY STATUS
function filterDashboardRooms(resetPage = true) {
  if (resetPage) currentRoomPage = 1;
  const filterVal = document.getElementById('statusFilter').value;
  const rows = document.querySelectorAll('#rooms-pane tbody tr[id^="room-row-"]');
  const visibleRows = [];

  rows.forEach(row => {
    const status = row.getAttribute('data-status');
    if (filterVal === 'all' || status === filterVal) {
      visibleRows.push(row);
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });

  renderRoomsPagination(visibleRows);
}

function renderRoomsPagination(visibleRows) {
  const totalItems = visibleRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const wrapper = document.getElementById('roomsPaginationWrapper');
  const container = document.getElementById('roomsPaginationContainer');

  if (!wrapper || !container) return;

  if (totalItems === 0) {
    wrapper.style.setProperty('display', 'none', 'important');
    return;
  }

  if (totalPages <= 1) {
    wrapper.style.setProperty('display', 'none', 'important');
  } else {
    wrapper.style.setProperty('display', 'flex', 'important');
  }

  const startIndex = (currentRoomPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  visibleRows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.setProperty('display', '', 'important');
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });

  let html = '';
  html += `<li class="page-item ${currentRoomPage === 1 ? 'disabled' : ''}">
             <a class="page-link" href="#" onclick="changeRoomPage(${currentRoomPage - 1}); return false;"><i class="bi bi-chevron-left"></i></a>
           </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${currentRoomPage === i ? 'active' : ''}">
               <a class="page-link" href="#" onclick="changeRoomPage(${i}); return false;">${i}</a>
             </li>`;
  }

  html += `<li class="page-item ${currentRoomPage === totalPages ? 'disabled' : ''}">
             <a class="page-link" href="#" onclick="changeRoomPage(${currentRoomPage + 1}); return false;"><i class="bi bi-chevron-right"></i></a>
           </li>`;

  container.innerHTML = html;
}

function changeRoomPage(page) {
  currentRoomPage = page;
  filterDashboardRooms(false);
}

// VIEW LANDLORD ROOMS IN MODAL
function viewLandlordRooms(landlordId, landlordUsername) {
  const modalLabel = document.getElementById('landlordRoomsModalLabel');
  modalLabel.textContent = `Bài đăng của chủ trọ: ${landlordUsername}`;

  const tableBody = document.getElementById('landlordRoomsTableBody');
  tableBody.innerHTML = '';

  if (typeof allRooms === 'undefined') return;

  const landlordRooms = allRooms.filter(r => String(r.host && r.host.id) === String(landlordId));

  if (landlordRooms.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 text-muted">Chủ trọ này chưa có bài đăng nào.</td>
      </tr>
    `;
  } else {
    landlordRooms.forEach(room => {
      const isAvail = room.isAvailable !== false;
      const imageUrl = room.images && room.images.length > 0 ? room.images[0] : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=120&h=80&q=80';
      const priceText = room.price ? (room.price / 1000000).toLocaleString('vi-VN') + ' triệu/tháng' : '0 triệu/tháng';
      const areaText = room.area ? room.area + ' m²' : '0 m²';
      
      const tr = document.createElement('tr');
      tr.id = `modal-room-row-${room.id}`;
      tr.innerHTML = `
        <td class="ps-3">
          <img src="${imageUrl}" alt="Room thumbnail" class="rounded" style="width: 80px; height: 55px; object-fit: cover;">
        </td>
        <td>
          <div class="fw-bold text-dark text-truncate" style="max-width: 250px;">${room.title}</div>
          <div class="text-muted small"><i class="bi bi-geo-alt me-1"></i>${room.address}</div>
        </td>
        <td>
          <div class="fw-bold text-danger">${priceText}</div>
          <div class="text-muted small">Diện tích: ${areaText}</div>
        </td>
        <td class="text-center">
          <span class="${isAvail ? 'badge-status-empty' : 'badge-status-rented'}" id="modal-room-badge-${room.id}">
            ${isAvail ? 'Còn trống' : 'Đã thuê'}
          </span>
        </td>
        <td class="text-center text-nowrap">
          <a href="/rooms/edit/${room.id}" class="btn btn-sm btn-outline-primary me-2 rounded"
             title="Chỉnh sửa tin đăng"
             style="width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
            <i class="bi bi-pencil-square"></i>
          </a>
          <button class="btn btn-sm btn-outline-secondary me-2 rounded btn-action-toggle" 
                  onclick="toggleRoomStatus('${room.id}')"
                  title="Đổi trạng thái phòng"
                  style="width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
            <i class="bi bi-arrow-repeat"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger rounded" 
                  onclick="deleteRoom('${room.id}')"
                  title="Xóa tin đăng"
                  style="width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  const modalEl = document.getElementById('landlordRoomsModal');
  const modalInstance = new bootstrap.Modal(modalEl);
  modalInstance.show();
}

// CLIENT-SIDE FILTER USERS BY NAME AND ROLE
function filterUsers(resetPage = true) {
  if (resetPage) currentUserPage = 1;
  const query = document.getElementById('userSearchInput').value.toLowerCase().trim();
  const roleFilter = document.getElementById('userRoleFilter').value;
  const rows = document.querySelectorAll('#users-pane tbody tr[id^="user-row-"]');
  const visibleRows = [];

  rows.forEach(row => {
    const username = row.getAttribute('data-username') || '';
    const role = row.getAttribute('data-role') || '';
    
    const matchesName = username.includes(query);
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    
    if (matchesName && matchesRole) {
      visibleRows.push(row);
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });

  renderUsersPagination(visibleRows);
}

function renderUsersPagination(visibleRows) {
  const totalItems = visibleRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const wrapper = document.getElementById('usersPaginationWrapper');
  const container = document.getElementById('usersPaginationContainer');

  if (!wrapper || !container) return;

  if (totalItems === 0) {
    wrapper.style.setProperty('display', 'none', 'important');
    return;
  }

  if (totalPages <= 1) {
    wrapper.style.setProperty('display', 'none', 'important');
  } else {
    wrapper.style.setProperty('display', 'flex', 'important');
  }

  const startIndex = (currentUserPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  visibleRows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.setProperty('display', '', 'important');
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });

  let html = '';
  html += `<li class="page-item ${currentUserPage === 1 ? 'disabled' : ''}">
             <a class="page-link" href="#" onclick="changeUserPage(${currentUserPage - 1}); return false;"><i class="bi bi-chevron-left"></i></a>
           </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${currentUserPage === i ? 'active' : ''}">
               <a class="page-link" href="#" onclick="changeUserPage(${i}); return false;">${i}</a>
             </li>`;
  }

  html += `<li class="page-item ${currentUserPage === totalPages ? 'disabled' : ''}">
             <a class="page-link" href="#" onclick="changeUserPage(${currentUserPage + 1}); return false;"><i class="bi bi-chevron-right"></i></a>
           </li>`;

  container.innerHTML = html;
}

function changeUserPage(page) {
  currentUserPage = page;
  filterUsers(false);
}



