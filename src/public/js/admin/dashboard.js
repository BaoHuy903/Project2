/**
 * Admin Dashboard JS
 * Requires: /js/shared/toast.js (loaded before this file via layout)
 */

// DELETE USER API CALL
async function deleteUser(id, username) {
  if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không? Hành động này không thể hoàn tác.`)) {
    return;
  }

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

// DELETE ROOM API CALL
async function deleteRoom(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa tin đăng phòng trọ này không?')) {
    return;
  }

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
    } else {
      showToast(result.message, false);
    }
  } catch (err) {
    showToast('Có lỗi xảy ra kết nối máy chủ.', false);
  }
}

// TOGGLE ROOM STATUS API CALL
async function toggleRoomStatus(id) {
  try {
    const response = await fetch(`/admin/rooms/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message, true);
      const badge = document.getElementById(`room-badge-${id}`);
      if (badge) {
        badge.textContent = result.isAvailable ? 'Còn trống' : 'Đã thuê';
        badge.className = result.isAvailable ? 'badge-status-empty' : 'badge-status-rented';
        badge.removeAttribute('style');
      }
    } else {
      showToast(result.message, false);
    }
  } catch (err) {
    showToast('Có lỗi xảy ra kết nối máy chủ.', false);
  }
}
