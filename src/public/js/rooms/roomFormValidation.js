document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roomForm');
  if (!form) return;

  // ── Floating Label: has-value class management ──
  // Ensures labels stay floated when inputs/selects have values
  function updateHasValue(el) {
    if (el.value && el.value.trim() !== '') {
      el.classList.add('has-value');
    } else {
      el.classList.remove('has-value');
    }
  }

  // Initialize has-value on all custom-input elements (covers pre-filled edit forms)
  form.querySelectorAll('.custom-input').forEach(el => {
    updateHasValue(el);
    el.addEventListener('change', () => updateHasValue(el));
    el.addEventListener('input', () => updateHasValue(el));
  });

  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');
  const uploadContent = document.querySelector('.upload-content');
  const uploadGroup = document.getElementById('uploadGroup');

  // Upload box logic
  if (fileInput && uploadArea && uploadContent) {
    fileInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        uploadContent.innerHTML = `<i class="bi bi-check-circle-fill text-success" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                                   <div class="upload-text text-success">Đã chọn ${this.files.length} ảnh mới</div>`;
        uploadArea.style.borderColor = '#198754';
        uploadArea.style.backgroundColor = '#d1e7dd';
      } else {
        const isEdit = form.action.includes('/edit');
        uploadContent.innerHTML = `<i class="bi bi-images upload-icon"></i>
                                   <div class="upload-text">${isEdit ? 'Thêm ảnh mới thay thế ảnh cũ' : 'Chọn hình ảnh hoặc kéo thả vào đây'}</div>`;
        uploadArea.style.borderColor = '#ced4da';
        uploadArea.style.backgroundColor = '#f8fafc';
      }
    });
  }

  // Character counts initialization
  const titleInput = document.getElementById('titleInput');
  const titleCharCount = document.getElementById('titleCharCount');
  if (titleInput && titleCharCount) {
    titleCharCount.textContent = `${titleInput.value.length}/70 kí tự`;
    titleInput.addEventListener('input', function () {
      titleCharCount.textContent = `${this.value.length}/70 kí tự`;
    });
  }

  const descriptionInput = document.getElementById('descriptionInput');
  const descCharCount = document.getElementById('descCharCount');
  if (descriptionInput && descCharCount) {
    descCharCount.textContent = `${descriptionInput.value.length}/1500 kí tự`;
    descriptionInput.addEventListener('input', function () {
      descCharCount.textContent = `${this.value.length}/1500 kí tự`;
    });
  }

  // Form validation on submit
  form.addEventListener('submit', function (e) {
    let isValid = true;
    const isEdit = form.action.includes('/edit');

    // 1. Address check
    const addressInput = document.getElementById('addressInput');
    const addressGroup = document.getElementById('addressGroup');
    if (addressInput && addressGroup) {
      if (!addressInput.value) {
        addressGroup.classList.add('error-state');
        isValid = false;
      } else {
        addressGroup.classList.remove('error-state');
      }
    }

    // 2. Area check
    const areaInput = document.getElementById('areaInput');
    const areaGroup = document.getElementById('areaGroup');
    if (areaInput && areaGroup) {
      if (!areaInput.value || Number(areaInput.value) <= 0) {
        areaGroup.classList.add('error-state');
        isValid = false;
      } else {
        areaGroup.classList.remove('error-state');
      }
    }

    // 3. Status check
    const statusInput = document.getElementById('statusInput');
    const statusGroup = document.getElementById('statusGroup');
    if (statusInput && statusGroup) {
      if (!statusInput.value) {
        statusGroup.classList.add('error-state');
        isValid = false;
      } else {
        statusGroup.classList.remove('error-state');
      }
    }

    // 4. File upload check (Only required for creation, optional for editing)
    if (fileInput && uploadGroup && !isEdit) {
      if (!fileInput.files || fileInput.files.length === 0) {
        uploadGroup.classList.add('error-state');
        isValid = false;
      } else {
        uploadGroup.classList.remove('error-state');
      }
    }

    // 5. Title check
    const titleGroup = document.getElementById('titleGroup');
    if (titleInput && titleGroup) {
      if (!titleInput.value || titleInput.value.trim().length < 10 || titleInput.value.trim().length > 70) {
        titleGroup.classList.add('error-state');
        isValid = false;
      } else {
        titleGroup.classList.remove('error-state');
      }
    }

    // 6. Price check
    const priceInput = document.getElementById('priceInput');
    const priceGroup = document.getElementById('priceGroup');
    if (priceInput && priceGroup) {
      if (!priceInput.value || Number(priceInput.value) <= 0) {
        priceGroup.classList.add('error-state');
        isValid = false;
      } else {
        priceGroup.classList.remove('error-state');
      }
    }

    // 7. Deposit check
    const depositInput = document.getElementById('depositInput');
    const depositGroup = document.getElementById('depositGroup');
    if (depositInput && depositGroup) {
      if (depositInput.value && Number(depositInput.value) < 0) {
        depositGroup.classList.add('error-state');
        isValid = false;
      } else {
        depositGroup.classList.remove('error-state');
      }
    }

    // Phone check
    const phoneInput = document.getElementById('phoneInput');
    const phoneGroup = document.getElementById('phoneGroup');
    const phoneRegex = /^0[35789]\d{8}$/;
    if (phoneInput && phoneGroup) {
      if (!phoneInput.value || !phoneRegex.test(phoneInput.value.trim())) {
        phoneGroup.classList.add('error-state');
        isValid = false;
      } else {
        phoneGroup.classList.remove('error-state');
      }
    }

    // 8. Description check
    const descriptionGroup = document.getElementById('descriptionGroup');
    if (descriptionInput && descriptionGroup) {
      if (!descriptionInput.value || descriptionInput.value.trim().length < 30 || descriptionInput.value.trim().length > 1500) {
        descriptionGroup.classList.add('error-state');
        isValid = false;
      } else {
        descriptionGroup.classList.remove('error-state');
      }
    }

    if (!isValid) {
      e.preventDefault();
      const toastEl = document.getElementById('errorToast');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
    }
  });
});
