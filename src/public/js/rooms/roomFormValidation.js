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

  // Dynamic Image Upload with Drag-and-Drop and Add-More List
  let selectedFiles = [];
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const addMoreBtn = document.getElementById('addMoreImagesBtn');
  const previewsContainer = document.getElementById('imagePreviewsContainer');
  const finalImagesInput = document.getElementById('finalImagesInput');
  const uploadGroup = document.getElementById('uploadGroup');

  if (uploadArea && fileInput && finalImagesInput) {
    const isEdit = form.action.includes('/edit');
    const uploadContent = document.getElementById('uploadContent');
    const initialUploadContentHTML = uploadContent ? uploadContent.innerHTML : '';

    // Click on uploadArea triggers file selection
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // Handle drag and drop events
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#1e3a8a';
        uploadArea.style.backgroundColor = '#eff6ff';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#cbd5e1';
        uploadArea.style.backgroundColor = '#ffffff';
      }, false);
    });

    uploadArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        addFiles(files);
      }
    });

    fileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        addFiles(this.files);
      }
    });

    if (addMoreBtn) {
      addMoreBtn.addEventListener('click', () => {
        fileInput.click();
      });
    }

    function addFiles(filesList) {
      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        if (file.type.startsWith('image/')) {
          selectedFiles.push(file);
        }
      }
      renderPreviews();
      updateFinalInput();
    }

    function renderPreviews() {
      previewsContainer.innerHTML = '';
      selectedFiles.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'position-relative border rounded overflow-hidden shadow-sm';
        card.style.width = '80px';
        card.style.height = '60px';

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'w-100 h-100';
        img.style.objectFit = 'cover';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'position-absolute top-0 end-0 btn btn-danger p-0 d-flex align-items-center justify-content-center rounded-circle';
        removeBtn.style.width = '18px';
        removeBtn.style.height = '18px';
        removeBtn.style.fontSize = '10px';
        removeBtn.style.margin = '2px';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Avoid triggering file selection
          selectedFiles.splice(index, 1);
          renderPreviews();
          updateFinalInput();
        });

        card.appendChild(img);
        card.appendChild(removeBtn);
        previewsContainer.appendChild(card);
      });

      if (uploadContent) {
        if (selectedFiles.length > 0) {
          uploadArea.style.backgroundColor = '#edf7ed';
          uploadArea.style.borderColor = '#198754';
          uploadArea.style.borderStyle = 'dashed';
          uploadContent.innerHTML = `
            <i class="bi bi-check-circle-fill text-success" style="font-size: 2.2rem; display: block; margin-bottom: 8px;"></i>
            <div class="upload-text text-success fw-semibold" style="color: #198754 !important;">Đã chọn ${selectedFiles.length} ảnh mới</div>
          `;
        } else {
          uploadArea.style.backgroundColor = '#f8fafc';
          uploadArea.style.borderColor = '#cbd5e1';
          uploadArea.style.borderStyle = 'dashed';
          uploadContent.innerHTML = initialUploadContentHTML;
        }
      }
    }

    function updateFinalInput() {
      const dt = new DataTransfer();
      selectedFiles.forEach(file => dt.items.add(file));
      finalImagesInput.files = dt.files;
    }

    // Initialize list preview display
    renderPreviews();
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
    descCharCount.textContent = descriptionInput.value.length;
    descriptionInput.addEventListener('input', function () {
      descCharCount.textContent = this.value.length;
    });
  }

  // Helper to format string with dots
  function formatNumberString(val) {
    if (typeof val !== 'string') val = String(val);
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return Number(clean).toLocaleString('vi-VN');
  }

  function setupFormattedInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // Change input type to text to support format
    input.type = 'text';
    input.inputMode = 'numeric';

    const updateValue = () => {
      // Format the input value
      const cursorSelectionStart = input.selectionStart;
      const originalLen = input.value.length;
      
      const formattedVal = formatNumberString(input.value);
      input.value = formattedVal;

      // Adjust cursor position
      const newLen = input.value.length;
      let newCursorPos = cursorSelectionStart + (newLen - originalLen);
      input.setSelectionRange(newCursorPos, newCursorPos);
    };

    // Format prefilled value
    if (input.value) {
      input.value = formatNumberString(input.value);
    }

    input.addEventListener('input', updateValue);
  }

  setupFormattedInput('priceInput');
  setupFormattedInput('depositInput');
  setupFormattedInput('electricityPriceInput');
  setupFormattedInput('waterPriceInput');

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
    if (uploadGroup && !isEdit) {
      if (selectedFiles.length === 0) {
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
      const rawPrice = priceInput.value.replace(/\D/g, '');
      if (!rawPrice || Number(rawPrice) <= 0) {
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
      const rawDeposit = depositInput.value.replace(/\D/g, '');
      if (rawDeposit && Number(rawDeposit) < 0) {
        depositGroup.classList.add('error-state');
        isValid = false;
      } else {
        depositGroup.classList.remove('error-state');
      }
    }

    // New Fields Check
    const depositMonthInput = document.getElementById('depositMonthInput');
    const depositMonthGroup = document.getElementById('depositMonthGroup');
    if (depositMonthInput && depositMonthGroup) {
      if (depositMonthInput.value && Number(depositMonthInput.value) < 0) {
        depositMonthGroup.classList.add('error-state');
        isValid = false;
      } else {
        depositMonthGroup.classList.remove('error-state');
      }
    }

    const electricityPriceInput = document.getElementById('electricityPriceInput');
    const electricityPriceGroup = document.getElementById('electricityPriceGroup');
    if (electricityPriceInput && electricityPriceGroup) {
      const rawElectricity = electricityPriceInput.value.replace(/\D/g, '');
      if (rawElectricity && Number(rawElectricity) < 0) {
        electricityPriceGroup.classList.add('error-state');
        isValid = false;
      } else {
        electricityPriceGroup.classList.remove('error-state');
      }
    }

    const waterPriceInput = document.getElementById('waterPriceInput');
    const waterPriceGroup = document.getElementById('waterPriceGroup');
    if (waterPriceInput && waterPriceGroup) {
      const rawWater = waterPriceInput.value.replace(/\D/g, '');
      if (rawWater && Number(rawWater) < 0) {
        waterPriceGroup.classList.add('error-state');
        isValid = false;
      } else {
        waterPriceGroup.classList.remove('error-state');
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
        const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        toast.show();
      }
    } else {
      // Strip thousand separators before sending to backend
      if (priceInput) priceInput.value = priceInput.value.replace(/\D/g, '');
      if (depositInput) depositInput.value = depositInput.value.replace(/\D/g, '');
      const electricityPriceInput = document.getElementById('electricityPriceInput');
      if (electricityPriceInput) electricityPriceInput.value = electricityPriceInput.value.replace(/\D/g, '');
      const waterPriceInput = document.getElementById('waterPriceInput');
      if (waterPriceInput) waterPriceInput.value = waterPriceInput.value.replace(/\D/g, '');
    }
  });
});
