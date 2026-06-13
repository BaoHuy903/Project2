/**
 * Shared toast notification utility
 * Dùng chung cho admin/dashboard.js và rooms/dashboard.js
 */
function showToast(message, isSuccess = true) {
  const toastEl = document.getElementById('toastMessage');
  const toastBody = document.getElementById('toastBody');
  if (toastEl && toastBody) {
    toastBody.textContent = message;
    toastEl.className = isSuccess
      ? 'toast align-items-center text-bg-success border-0 rounded-3'
      : 'toast align-items-center text-bg-danger border-0 rounded-3';
    const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
    toast.show();
  }
}
