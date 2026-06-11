/**
 * Auth Validation JS
 * Xử lý tất cả form validation cho trang xác thực:
 * - Đăng ký (#registerForm)
 * - Đổi mật khẩu (#changeForm)
 * - Quên mật khẩu (#forgotForm)
 */

// =============================================
// SHARED UTILITIES
// =============================================

/**
 * Toggle hiển thị/ẩn mật khẩu
 * @param {string} inputId - ID của input password
 * @param {string} iconId  - ID của icon mắt
 */
function togglePassword(inputId = 'password', iconId = 'eyeIcon') {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('bi-eye', 'bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('bi-eye-slash', 'bi-eye');
  }
}

/**
 * Gắn logic kiểm tra độ mạnh mật khẩu vào một input
 * @param {HTMLInputElement} passwordInput - Input mật khẩu
 * @param {HTMLElement} reqLength   - Phần tử hiển thị yêu cầu độ dài
 * @param {HTMLElement} reqAlphaNum - Phần tử hiển thị yêu cầu có chữ+số
 */
function bindPasswordStrength(passwordInput, reqLength, reqAlphaNum) {
  if (!passwordInput || !reqLength || !reqAlphaNum) return;

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const isLongEnough = val.length >= 6;

    // Cập nhật icon & class cho yêu cầu độ dài
    if (isLongEnough) {
      reqLength.classList.replace('invalid', 'valid');
      reqLength.querySelector('i').className = 'bi bi-check-circle-fill';
    } else {
      reqLength.classList.replace('valid', 'invalid');
      reqLength.querySelector('i').className = 'bi bi-x-circle-fill';
    }

    // Cập nhật icon & class cho yêu cầu chữ + số
    if (hasLetter && hasNumber) {
      reqAlphaNum.classList.replace('invalid', 'valid');
      reqAlphaNum.querySelector('i').className = 'bi bi-check-circle-fill';
    } else {
      reqAlphaNum.classList.replace('valid', 'invalid');
      reqAlphaNum.querySelector('i').className = 'bi bi-x-circle-fill';
    }

    // Đặt custom validity
    passwordInput.setCustomValidity(
      isLongEnough && hasLetter && hasNumber ? '' : 'Weak password'
    );
  });
}

/**
 * Gắn logic kiểm tra xác nhận mật khẩu khớp nhau
 * @param {HTMLInputElement} passwordInput - Input mật khẩu mới
 * @param {HTMLInputElement} confirmInput  - Input xác nhận mật khẩu
 * @param {HTMLElement} confirmFeedback    - Phần tử hiển thị lỗi
 */
function bindConfirmPassword(passwordInput, confirmInput, confirmFeedback) {
  if (!passwordInput || !confirmInput) return;

  const validate = () => {
    if (confirmInput.value !== passwordInput.value) {
      confirmInput.setCustomValidity('Mismatch');
      if (confirmFeedback) confirmFeedback.textContent = 'Xác nhận mật khẩu mới không khớp.';
    } else {
      confirmInput.setCustomValidity('');
    }
  };

  confirmInput.addEventListener('input', validate);
  passwordInput.addEventListener('input', validate);
}

// =============================================
// DOM READY
// =============================================
document.addEventListener('DOMContentLoaded', () => {

  // --- ĐĂNG NHẬP: Hiện toast đăng ký thành công ---
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('registered')) {
    const toastEl = document.getElementById('regToast');
    if (toastEl) {
      new bootstrap.Toast(toastEl).show();
      // Xóa query param khỏi URL mà không reload trang
      const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
      window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    }
  }

  // =============================================
  // FORM: ĐĂNG KÝ (#registerForm)
  // =============================================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const usernameInput = document.getElementById('username');
    const usernameFeedback = document.getElementById('usernameFeedback');
    const passwordInput = document.getElementById('password');

    // Validation username real-time
    if (usernameInput && usernameFeedback) {
      usernameInput.addEventListener('input', () => {
        const val = usernameInput.value;
        const regex = /^[a-zA-Z0-9_]+$/;

        if (val.length < 3) {
          usernameInput.setCustomValidity('Too short');
          usernameFeedback.textContent = 'Tài khoản phải dài tối thiểu 3 ký tự.';
        } else if (!regex.test(val)) {
          usernameInput.setCustomValidity('Invalid characters');
          usernameFeedback.textContent = 'Tài khoản chỉ được dùng chữ cái, chữ số và dấu gạch dưới (_).';
        } else {
          usernameInput.setCustomValidity('');
        }
      });
    }

    // Validation mật khẩu real-time (dùng shared helper)
    bindPasswordStrength(
      passwordInput,
      document.getElementById('reqLength'),
      document.getElementById('reqAlphaNum')
    );

    // Submit validation
    registerForm.addEventListener('submit', event => {
      if (usernameInput) usernameInput.dispatchEvent(new Event('input'));
      if (passwordInput) passwordInput.dispatchEvent(new Event('input'));

      // Kiểm tra chọn vai trò
      const selectedRole = document.getElementById('selectedRole');
      const roleFeedback = document.getElementById('roleFeedback');
      if (selectedRole && !selectedRole.value) {
        if (roleFeedback) roleFeedback.classList.remove('d-none');
        selectedRole.setCustomValidity('Please select a role');
        event.preventDefault();
        event.stopPropagation();
      } else if (selectedRole) {
        if (roleFeedback) roleFeedback.classList.add('d-none');
        selectedRole.setCustomValidity('');
      }

      if (!registerForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      registerForm.classList.add('was-validated');
    });
  }

  // =============================================
  // FORM: ĐỔI MẬT KHẨU (#changeForm)
  // =============================================
  const changeForm = document.getElementById('changeForm');
  if (changeForm) {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    bindPasswordStrength(
      passwordInput,
      document.getElementById('reqLength'),
      document.getElementById('reqAlphaNum')
    );

    bindConfirmPassword(passwordInput, confirmInput, document.getElementById('confirmFeedback'));

    changeForm.addEventListener('submit', event => {
      if (passwordInput) passwordInput.dispatchEvent(new Event('input'));
      if (confirmInput) confirmInput.dispatchEvent(new Event('input'));

      if (!changeForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      changeForm.classList.add('was-validated');
    });
  }

  // =============================================
  // FORM: QUÊN MẬT KHẨU (#forgotForm)
  // =============================================
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');

    bindPasswordStrength(
      passwordInput,
      document.getElementById('reqLength'),
      document.getElementById('reqAlphaNum')
    );

    bindConfirmPassword(passwordInput, confirmInput, document.getElementById('confirmFeedback'));

    forgotForm.addEventListener('submit', event => {
      if (passwordInput) passwordInput.dispatchEvent(new Event('input'));
      if (confirmInput) confirmInput.dispatchEvent(new Event('input'));

      if (!forgotForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      forgotForm.classList.add('was-validated');
    });
  }

  // =============================================
  // FALLBACK: Bootstrap form validation chung
  // =============================================
  const genericForms = document.querySelectorAll(
    '.needs-validation:not(#registerForm):not(#changeForm):not(#forgotForm)'
  );
  genericForms.forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
});

// =============================================
// ROLE SELECTION (Trang đăng ký)
// =============================================
/**
 * Chọn vai trò khi đăng ký tài khoản
 * @param {string} role - 'TENANT' hoặc 'LANDLORD'
 */
function selectRole(role) {
  const selectedRoleInput = document.getElementById('selectedRole');
  if (!selectedRoleInput) return;

  selectedRoleInput.value = role;

  // Toggle active class trên các role cards
  document.querySelectorAll('#roleCards .role-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-role') === role);
  });

  // Ẩn error feedback
  const roleFeedback = document.getElementById('roleFeedback');
  if (roleFeedback) roleFeedback.classList.add('d-none');
  selectedRoleInput.setCustomValidity('');
}
