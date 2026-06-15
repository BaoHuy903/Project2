let deleteCallback = null;
let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      deleteCallback?.();
      bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')).hide();
    });
  }
  filterDashboardRooms();
});

const confirmAction = (title, message, callback) => {
  document.getElementById('confirmDeleteTitle').textContent = title;
  document.getElementById('confirmDeleteMessage').textContent = message;
  deleteCallback = callback;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('confirmDeleteModal')).show();
};

const deleteRoom = (id) => {
  confirmAction(
    'Xác nhận xóa phòng trọ',
    'Bạn có chắc chắn muốn xóa tin đăng phòng trọ này không? Hành động này không thể hoàn tác.',
    async () => {
      try {
        const response = await fetch(`/rooms/${id}`, { method: 'DELETE' });
        const result = await response.json();
        showToast(result.message, result.success);
        if (result.success) {
          document.getElementById(`room-row-${id}`)?.remove();
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (err) {
        showToast('Có lỗi xảy ra kết nối máy chủ.', false);
      }
    }
  );
};

const toggleRoomStatus = async (id) => {
  const badge = document.getElementById(`room-badge-${id}`);
  const buttons = document.querySelectorAll(`#room-row-${id} .btn-action-toggle`);
  
  if (badge) {
    badge.style.opacity = '0.6';
    badge.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status"></span> Đang lưu...`;
  }
  buttons.forEach(btn => btn.disabled = true);

  try {
    const response = await fetch(`/rooms/${id}/status`, { method: 'PATCH' });
    const result = await response.json();
    showToast(result.message, result.success);
    
    if (result.success && badge) {
      badge.textContent = result.isAvailable ? 'Còn trống' : 'Đã thuê';
      badge.className = result.isAvailable ? 'badge-status-empty' : 'badge-status-rented';
      badge.removeAttribute('style');
      setTimeout(() => window.location.reload(), 1000);
    } else if (badge) {
      badge.removeAttribute('style');
    }
  } catch (err) {
    showToast('Có lỗi xảy ra kết nối máy chủ.', false);
    badge?.removeAttribute('style');
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
};

// CLIENT-SIDE FILTER BY STATUS
function filterDashboardRooms(resetPage = true) {
  if (resetPage) currentPage = 1;
  const filterVal = document.getElementById('statusFilter').value;
  const rows = document.querySelectorAll('tbody tr[id^="room-row-"]');
  const visibleRows = [];

  rows.forEach(row => {
    const status = row.getAttribute('data-status');
    if (filterVal === 'all' || status === filterVal) {
      visibleRows.push(row);
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });

  renderPagination(visibleRows);
}

function renderPagination(visibleRows) {
  const totalItems = visibleRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const wrapper = document.getElementById('paginationWrapper');
  const container = document.getElementById('paginationContainer');

  if (!wrapper || !container) return;

  if (totalItems === 0) {
    wrapper.style.setProperty('display', 'none', 'important');
    return;
  }

  // Hide wrapper if only 1 page
  if (totalPages <= 1) {
    wrapper.style.setProperty('display', 'none', 'important');
  } else {
    wrapper.style.setProperty('display', 'flex', 'important');
  }

  // Calculate start and end indices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Show only rows for current page
  visibleRows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.setProperty('display', '', 'important');
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });

  // Render pagination controls
  let html = '';
  
  // Prev button
  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
             <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;"><i class="bi bi-chevron-left"></i></a>
           </li>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${currentPage === i ? 'active' : ''}">
               <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
             </li>`;
  }

  // Next button
  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
             <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;"><i class="bi bi-chevron-right"></i></a>
           </li>`;

  container.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(document.querySelectorAll('tbody tr[id^="room-row-"]:not([style*="display: none"])').length / itemsPerPage);
  // Actually we need the filtered rows total, so we can just use the length or simply set current page and filter again (which calculates everything)
  currentPage = page;
  filterDashboardRooms(false);
}

