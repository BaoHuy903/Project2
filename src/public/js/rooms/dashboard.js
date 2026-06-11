/**
 * Landlord Dashboard JS
 * Requires: /js/shared/toast.js (loaded before this file via layout)
 */

// DELETE ROOM API CALL
async function deleteRoom(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa tin đăng phòng trọ này không?')) {
    return;
  }

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

// TOGGLE ROOM STATUS API CALL
async function toggleRoomStatus(id) {
  try {
    const response = await fetch(`/rooms/${id}/status`, {
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
