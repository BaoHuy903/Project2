let deleteCallback = null;

document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (deleteCallback) deleteCallback();
      const modalEl = document.getElementById('confirmDeleteModal');
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.hide();
    });
  }

  // Handle tab switching manually
  const tabButtons = document.querySelectorAll('.db-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => {
        p.classList.remove('show', 'active');
      });
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-bs-target');
      const targetPane = document.querySelector(targetId);
      if (targetPane) {
        targetPane.classList.add('show', 'active');
      }
    });
  });
});

function confirmAction(title, message, callback) {
  document.getElementById('confirmDeleteTitle').textContent = title;
  document.getElementById('confirmDeleteMessage').textContent = message;
  deleteCallback = callback;
  
  const modalEl = document.getElementById('confirmDeleteModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
}

// DELETE USER API CALL
function deleteUser(id, username) {
  confirmAction(
    'Xác nhận xóa tài khoản',
    `Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Hành động này không thể hoàn tác và toàn bộ dữ liệu liên quan sẽ bị xóa bỏ.`,
    async () => {
      try {
        const response = await fetch(`/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
          showToast(result.message, true);
          const row = document.getElementById(`user-row-${id}`);
          if (row) row.remove();
        } else {
          showToast(result.message, false);
        }
      } catch (err) {
        showToast('Có lỗi xảy ra kết nối máy chủ.', false);
      }
    }
  );
}

// DELETE ROOM API CALL
function deleteRoom(id) {
  confirmAction(
    'Xác nhận xóa phòng trọ',
    'Bạn có chắc chắn muốn xóa tin đăng phòng trọ này không? Hành động này không thể hoàn tác.',
    async () => {
      try {
        const response = await fetch(`/admin/rooms/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
          showToast(result.message, true);
          const row = document.getElementById(`room-row-${id}`);
          if (row) row.remove();
          const modalRow = document.getElementById(`modal-room-row-${id}`);
          if (modalRow) modalRow.remove();
          if (typeof allRooms !== 'undefined') {
            const index = allRooms.findIndex(r => String(r.id) === String(id));
            if (index > -1) allRooms.splice(index, 1);
          }
        } else {
          showToast(result.message, false);
        }
      } catch (err) {
        showToast('Có lỗi xảy ra kết nối máy chủ.', false);
      }
    }
  );
}

// TOGGLE ROOM STATUS API CALL
async function toggleRoomStatus(id) {
  const badge = document.getElementById(`room-badge-${id}`);
  const modalBadge = document.getElementById(`modal-room-badge-${id}`);
  const buttons = document.querySelectorAll(`#room-row-${id} .btn-action-toggle, #modal-room-row-${id} .btn-action-toggle`);

  if (badge) {
    badge.style.opacity = '0.6';
    badge.innerHTML = `<span class="spinner-border spinner-border-sm me-1" style="width: 0.8rem; height: 0.8rem;" role="status" aria-hidden="true"></span> Đang lưu...`;
  }
  if (modalBadge) {
    modalBadge.style.opacity = '0.6';
    modalBadge.innerHTML = `<span class="spinner-border spinner-border-sm me-1" style="width: 0.8rem; height: 0.8rem;" role="status" aria-hidden="true"></span> Đang lưu...`;
  }
  buttons.forEach(btn => btn.disabled = true);

  try {
    const response = await fetch(`/admin/rooms/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message, true);
      if (badge) {
        badge.textContent = result.isAvailable ? 'Còn trống' : 'Đã thuê';
        badge.className = result.isAvailable ? 'badge-status-empty' : 'badge-status-rented';
        badge.removeAttribute('style');
      }
      if (modalBadge) {
        modalBadge.textContent = result.isAvailable ? 'Còn trống' : 'Đã thuê';
        modalBadge.className = result.isAvailable ? 'badge-status-empty' : 'badge-status-rented';
        modalBadge.removeAttribute('style');
      }
      if (typeof allRooms !== 'undefined') {
        const room = allRooms.find(r => String(r.id) === String(id));
        if (room) room.isAvailable = result.isAvailable;
      }
    } else {
      showToast(result.message, false);
      if (badge) badge.removeAttribute('style');
      if (modalBadge) modalBadge.removeAttribute('style');
    }
  } catch (err) {
    showToast('Có lỗi xảy ra kết nối máy chủ.', false);
    if (badge) badge.removeAttribute('style');
    if (modalBadge) modalBadge.removeAttribute('style');
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
}

// Pagination State
let currentRoomPage = 1;
let currentUserPage = 1;
const itemsPerPage = 6;

// CLIENT-SIDE FILTER & PAGINATION FOR ROOMS
function filterDashboardRooms(page = 1) {
  currentRoomPage = page;
  const filterVal = document.getElementById('statusFilter').value;
  const rows = Array.from(document.querySelectorAll('tbody tr[id^="room-row-"]'));
  
  // Filter
  const filteredRows = rows.filter(row => {
    const status = row.getAttribute('data-status');
    return filterVal === 'all' || status === filterVal;
  });

  // Hide all
  rows.forEach(row => row.style.setProperty('display', 'none', 'important'));

  // Show paginated
  const start = (currentRoomPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  filteredRows.slice(start, end).forEach(row => {
    row.style.setProperty('display', '', 'important');
  });

  renderPagination('roomsPagination', filteredRows.length, currentRoomPage, 'filterDashboardRooms');
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

// CLIENT-SIDE FILTER & PAGINATION FOR USERS
function filterUsers(page = 1) {
  currentUserPage = page;
  const query = document.getElementById('userSearchInput').value.toLowerCase().trim();
  const roleFilter = document.getElementById('userRoleFilter').value;
  const rows = Array.from(document.querySelectorAll('tbody tr[id^="user-row-"]'));
  
  // Filter
  const filteredRows = rows.filter(row => {
    const username = row.getAttribute('data-username') || '';
    const role = row.getAttribute('data-role') || '';
    const matchesName = username.includes(query);
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    return matchesName && matchesRole;
  });

  // Hide all
  rows.forEach(row => row.style.setProperty('display', 'none', 'important'));

  // Show paginated
  const start = (currentUserPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  filteredRows.slice(start, end).forEach(row => {
    row.style.setProperty('display', '', 'important');
  });

  renderPagination('usersPagination', filteredRows.length, currentUserPage, 'filterUsers');
}

// Render Pagination UI
function renderPagination(containerId, totalItems, currentPage, funcName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let html = '';
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  // Prev Button
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="event.preventDefault(); if(${currentPage} > 1) ${funcName}(${currentPage - 1})">&laquo; Trang trước</a>
    </li>
  `;

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); ${funcName}(${i})">${i}</a>
      </li>
    `;
  }

  // Next Button
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="event.preventDefault(); if(${currentPage} < ${totalPages}) ${funcName}(${currentPage + 1})">Trang sau &raquo;</a>
    </li>
  `;

  container.innerHTML = html;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  filterDashboardRooms(1);
  filterUsers(1);
});



