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
});

function confirmAction(title, message, callback) {
  document.getElementById('confirmDeleteTitle').textContent = title;
  document.getElementById('confirmDeleteMessage').textContent = message;
  deleteCallback = callback;
  
  const modalEl = document.getElementById('confirmDeleteModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
  modalInstance.show();
}

// DELETE ROOM API CALL
function deleteRoom(id) {
  confirmAction(
    'Xác nhận xóa phòng trọ',
    'Bạn có chắc chắn muốn xóa tin đăng phòng trọ này không? Hành động này không thể hoàn tác.',
    async () => {
      try {
        const response = await fetch(`/rooms/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
          showToast(result.message, true);
          const row = document.getElementById(`room-row-${id}`);
          if (row) {
            row.remove();
            // Reload sau 1 giây để cập nhật thẻ thống kê
            setTimeout(() => window.location.reload(), 1000);
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
  // Select badge and buttons to show loading state
  const badge = document.getElementById(`room-badge-${id}`);
  const buttons = document.querySelectorAll(`#room-row-${id} .btn-action-toggle`);
  
  if (badge) {
    badge.style.opacity = '0.6';
    badge.innerHTML = `<span class="spinner-border spinner-border-sm me-1" style="width: 0.8rem; height: 0.8rem;" role="status" aria-hidden="true"></span> Đang lưu...`;
  }
  buttons.forEach(btn => btn.disabled = true);

  try {
    const response = await fetch(`/rooms/${id}/status`, {
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
        // Reload sau 1 giây để cập nhật thẻ thống kê
        setTimeout(() => window.location.reload(), 1000);
      }
    } else {
      showToast(result.message, false);
      if (badge) badge.removeAttribute('style');
    }
  } catch (err) {
    showToast('Có lỗi xảy ra kết nối máy chủ.', false);
    if (badge) badge.removeAttribute('style');
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
}

// CLIENT-SIDE FILTER BY STATUS
function filterDashboardRooms() {
  const filterVal = document.getElementById('statusFilter').value;
  const rows = document.querySelectorAll('tbody tr[id^="room-row-"]');
  rows.forEach(row => {
    const status = row.getAttribute('data-status');
    if (filterVal === 'all' || status === filterVal) {
      row.style.setProperty('display', '', 'important');
    } else {
      row.style.setProperty('display', 'none', 'important');
    }
  });
}

