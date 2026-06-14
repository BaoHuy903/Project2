document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roomForm');
  if (!form) return;

  // ── Multi-step Form State & Navigation ──
  let currentStep = 1;
  const maxSteps = 6;
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnSubmitReal = document.getElementById('btnSubmitReal');
  const stepIndicatorText = document.getElementById('stepIndicatorText');

  // Handle step updates
  function updateStepsUI() {
    // Hide all step panes
    document.querySelectorAll('.step-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    // Show current step pane
    const currentPane = document.getElementById(`stepPane-${currentStep}`);
    if (currentPane) {
      currentPane.classList.add('active');
    }

    // Update Stepper Header active/completed states
    document.querySelectorAll('.stepper-step').forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      if (stepNum === currentStep) {
        step.className = 'stepper-step active';
      } else if (stepNum < currentStep) {
        step.className = 'stepper-step completed';
      } else {
        step.className = 'stepper-step';
      }
    });

    // Update step indicator label
    if (stepIndicatorText) {
      stepIndicatorText.textContent = `Bước ${currentStep} trên ${maxSteps}`;
    }

    // Manage buttons visibility
    if (currentStep === 1) {
      if (btnPrev) btnPrev.style.display = 'none';
    } else {
      if (btnPrev) btnPrev.style.display = 'inline-flex';
    }

    if (currentStep === maxSteps) {
      if (btnNext) btnNext.style.display = 'none';
      if (btnSubmitReal) btnSubmitReal.style.display = 'inline-flex';
      buildFormSummary();
    } else {
      if (btnNext) btnNext.style.display = 'inline-flex';
      if (btnSubmitReal) btnSubmitReal.style.display = 'none';
    }

    // Scroll to top of form smoothly on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Validate the current step fields
  function validateCurrentStep() {
    let isValid = true;
    const isEdit = form.action.includes('/edit');

    // Remove any previous error indicators in the current step pane
    const currentPane = document.getElementById(`stepPane-${currentStep}`);
    if (currentPane) {
      currentPane.querySelectorAll('.error-state').forEach(el => el.classList.remove('error-state'));
    }

    if (currentStep === 1) {
      // Step 1: Title, occupancy (status), phone, description
      const titleInput = document.getElementById('titleInput');
      const titleGroup = document.getElementById('titleGroup');
      if (titleInput && titleGroup) {
        if (!titleInput.value || titleInput.value.trim().length < 10 || titleInput.value.trim().length > 70) {
          titleGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const statusInput = document.getElementById('statusInput');
      const statusGroup = document.getElementById('statusGroup');
      if (statusInput && statusGroup) {
        if (!statusInput.value) {
          statusGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const phoneInput = document.getElementById('phoneInput');
      const phoneGroup = document.getElementById('phoneGroup');
      const phoneRegex = /^0[35789]\d{8}$/;
      if (phoneInput && phoneGroup) {
        if (!phoneInput.value || !phoneRegex.test(phoneInput.value.trim())) {
          phoneGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const descriptionInput = document.getElementById('descriptionInput');
      const descriptionGroup = document.getElementById('descriptionGroup');
      if (descriptionInput && descriptionGroup) {
        if (!descriptionInput.value || descriptionInput.value.trim().length < 30 || descriptionInput.value.trim().length > 1500) {
          descriptionGroup.classList.add('error-state');
          isValid = false;
        }
      }
    } 
    else if (currentStep === 2) {
      // Step 2: District and Ward selects
      const districtInput = document.getElementById('districtInput');
      const districtGroup = document.getElementById('districtGroup');
      if (districtInput && districtGroup) {
        if (!districtInput.value) {
          districtGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const addressInput = document.getElementById('addressInput');
      const addressGroup = document.getElementById('addressGroup');
      if (addressInput && addressGroup) {
        if (!addressInput.value) {
          addressGroup.classList.add('error-state');
          isValid = false;
        }
      }
    } 
    else if (currentStep === 3) {
      // Step 3: Price, area, deposit, depositMonth
      const priceInput = document.getElementById('priceInput');
      const priceGroup = document.getElementById('priceGroup');
      if (priceInput && priceGroup) {
        const rawPrice = priceInput.value.replace(/\D/g, '');
        if (!rawPrice || Number(rawPrice) <= 0) {
          priceGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const areaInput = document.getElementById('areaInput');
      const areaGroup = document.getElementById('areaGroup');
      if (areaInput && areaGroup) {
        if (!areaInput.value || Number(areaInput.value) <= 0) {
          areaGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const depositInput = document.getElementById('depositInput');
      const depositGroup = document.getElementById('depositGroup');
      if (depositInput && depositGroup) {
        const rawDeposit = depositInput.value.replace(/\D/g, '');
        if (rawDeposit && Number(rawDeposit) < 0) {
          depositGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const depositMonthInput = document.getElementById('depositMonthInput');
      const depositMonthGroup = document.getElementById('depositMonthGroup');
      if (depositMonthInput && depositMonthGroup) {
        if (depositMonthInput.value && Number(depositMonthInput.value) < 0) {
          depositMonthGroup.classList.add('error-state');
          isValid = false;
        }
      }
    } 
    else if (currentStep === 4) {
      // Step 4: category, electricityPrice, waterPrice (non-negatives if provided)
      const electricityPriceInput = document.getElementById('electricityPriceInput');
      const electricityPriceGroup = document.getElementById('electricityPriceGroup');
      if (electricityPriceInput && electricityPriceGroup) {
        const rawElectricity = electricityPriceInput.value.replace(/\D/g, '');
        if (rawElectricity && Number(rawElectricity) < 0) {
          electricityPriceGroup.classList.add('error-state');
          isValid = false;
        }
      }

      const waterPriceInput = document.getElementById('waterPriceInput');
      const waterPriceGroup = document.getElementById('waterPriceGroup');
      if (waterPriceInput && waterPriceGroup) {
        const rawWater = waterPriceInput.value.replace(/\D/g, '');
        if (rawWater && Number(rawWater) < 0) {
          waterPriceGroup.classList.add('error-state');
          isValid = false;
        }
      }
    } 
    else if (currentStep === 5) {
      // Step 5: Images (Required on creation, must have at least 1 total on edit)
      const uploadGroup = document.getElementById('uploadGroup');
      if (uploadGroup) {
        if (!isEdit) {
          if (selectedFiles.length === 0) {
            uploadGroup.classList.add('error-state');
            isValid = false;
          }
        } else {
          const keepInput = document.getElementById('keepImagesInput');
          const remainingOldImages = keepInput && keepInput.value ? keepInput.value.split(',').filter(Boolean).length : 0;
          if (remainingOldImages === 0 && selectedFiles.length === 0) {
            uploadGroup.classList.add('error-state');
            isValid = false;
          }
        }
      }
    }

    if (!isValid) {
      const toastEl = document.getElementById('errorToast');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl, { delay: 5000 });
        toast.show();
      }
    }

    return isValid;
  }

  // Next step click
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep < maxSteps) {
          currentStep++;
          updateStepsUI();
        }
      }
    });
  }

  // Prev step click
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepsUI();
      }
    });
  }

  // Form Summary builder
  function buildFormSummary() {
    const summaryContainer = document.getElementById('formSummary');
    if (!summaryContainer) return;

    const title = document.getElementById('titleInput')?.value || '';
    const status = document.getElementById('statusInput')?.value || '';
    const phone = document.getElementById('phoneInput')?.value || '';
    const address = document.getElementById('addressInput')?.value || '';
    const price = document.getElementById('priceInput')?.value || 'Thỏa thuận';
    const area = document.getElementById('areaInput')?.value || '0';
    const deposit = document.getElementById('depositInput')?.value || '0';
    const depositMonth = document.getElementById('depositMonthInput')?.value || '';
    const paymentCycle = document.getElementById('paymentCycleInput')?.value || '';
    const category = document.getElementById('categoryInput')?.value || 'Không có';
    const electricity = document.getElementById('electricityPriceInput')?.value || '';
    const water = document.getElementById('waterPriceInput')?.value || '';
    
    // Checked amenities
    const checkedAmenityLabels = [];
    document.querySelectorAll('.amenities-grid-form input[type="checkbox"]:checked').forEach(cb => {
      const span = cb.nextElementSibling.nextElementSibling;
      if (span) checkedAmenityLabels.push(span.textContent);
    });

    let imagesCount = selectedFiles.length;
    const isEdit = form.action.includes('/edit');

    // Human-readable status mapping
    let statusText = status;
    if (status === '1') statusText = 'Ở đơn';
    else if (status === '2') statusText = 'Ở ghép';
    else if (status === 'available') statusText = 'Còn trống';
    else if (status === 'rented') statusText = 'Đã thuê';

    let summaryHTML = `
      <div class="row g-3">
        <!-- Cột trái -->
        <div class="col-md-6">
          <div class="summary-item">
            <div class="summary-label">Tiêu đề:</div>
            <div class="summary-value text-dark fw-bold">${title}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Số lượng người:</div>
            <div class="summary-value">${statusText}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">SĐT liên hệ:</div>
            <div class="summary-value">${phone}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Địa chỉ:</div>
            <div class="summary-value">${address}</div>
          </div>
        </div>

        <!-- Cột phải -->
        <div class="col-md-6">
          <div class="summary-item">
            <div class="summary-label">Giá thuê:</div>
            <div class="summary-value text-danger fw-bold">${price && price !== 'Thỏa thuận' ? `${price} đ/tháng` : 'Thỏa thuận'}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Diện tích:</div>
            <div class="summary-value fw-semibold">${area} m²</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tiền đặt cọc:</div>
            <div class="summary-value">${deposit && deposit !== '0' ? `${deposit} đ` : '0 đ'} ${depositMonth ? `(${depositMonth} tháng)` : ''}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Chu kỳ đóng tiền:</div>
            <div class="summary-value">${paymentCycle ? `${paymentCycle} tháng` : 'Chưa cập nhật'}</div>
          </div>
        </div>

        <!-- Đường gạch ngang phân chia -->
        <div class="col-12"><hr class="my-2" style="border-color: #e2e8f0; opacity: 0.8;"></div>

        <!-- Dưới cột trái -->
        <div class="col-md-6">
          <div class="summary-item">
            <div class="summary-label">Nội thất:</div>
            <div class="summary-value">${category}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tiền điện:</div>
            <div class="summary-value">${electricity ? `${electricity} đ/kWh` : 'Chưa cập nhật'}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tiền nước:</div>
            <div class="summary-value">${water ? `${water} đ/m³` : 'Chưa cập nhật'}</div>
          </div>
        </div>

        <!-- Dưới cột phải -->
        <div class="col-md-6">
          <div class="summary-item">
            <div class="summary-label">Tiện ích đã chọn:</div>
            <div class="summary-value">
              ${checkedAmenityLabels.length > 0 ? checkedAmenityLabels.map(l => `<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 me-1 mb-1 small fw-semibold">${l}</span>`).join('') : '<span class="text-muted">Không có tiện ích nào</span>'}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Hình ảnh phòng:</div>
            <div class="summary-value">
              ${(() => {
                const keepInput = document.getElementById('keepImagesInput');
                const remainingOldImages = keepInput && keepInput.value ? keepInput.value.split(',').filter(Boolean).length : 0;
                if (!isEdit) {
                  return imagesCount > 0 
                    ? `<span class="text-success fw-semibold"><i class="bi bi-check-circle-fill me-1"></i> Tải lên ${imagesCount} hình ảnh</span>`
                    : `<span class="text-danger fw-semibold">Chưa chọn hình ảnh</span>`;
                } else {
                  if (remainingOldImages > 0 && imagesCount > 0) {
                    return `<span class="text-success fw-semibold"><i class="bi bi-check-circle-fill me-1"></i> Giữ ${remainingOldImages} ảnh cũ & thêm ${imagesCount} ảnh mới</span>`;
                  } else if (remainingOldImages > 0 && imagesCount === 0) {
                    return `<span class="text-primary fw-semibold"><i class="bi bi-info-circle me-1"></i> Giữ nguyên hình ảnh cũ</span>`;
                  } else if (remainingOldImages === 0 && imagesCount > 0) {
                    return `<span class="text-success fw-semibold"><i class="bi bi-check-circle-fill me-1"></i> Thay thế bằng ${imagesCount} ảnh mới</span>`;
                  } else {
                    return `<span class="text-danger fw-semibold"><i class="bi bi-exclamation-triangle me-1"></i> Không có hình ảnh nào</span>`;
                  }
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
  }

  // Amenity Checkbox custom click
  window.toggleFormAmenity = function(card) {
    const checkbox = card.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
  };


  // ── Floating Label: has-value class management ──
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

  // Dynamic District -> Ward selector population logic
  const districtInput = document.getElementById('districtInput');
  const addressInput = document.getElementById('addressInput');
  
  if (districtInput && addressInput) {
    districtInput.addEventListener('change', () => {
      const dist = districtInput.value;
      addressInput.innerHTML = '<option value="" selected disabled></option>';
      if (dist && typeof DANANG_WARDS !== 'undefined' && DANANG_WARDS[dist]) {
        DANANG_WARDS[dist].forEach(ward => {
          const opt = document.createElement('option');
          opt.value = ward;
          opt.textContent = ward.split(',')[0].trim();
          addressInput.appendChild(opt);
        });
      }
      addressInput.classList.remove('has-value');
      updateHasValue(addressInput);
      updateHasValue(districtInput);
    });
  }

  // Parse existing address during edit
  if (typeof EXISTING_ADDRESS_VAL !== 'undefined' && EXISTING_ADDRESS_VAL && districtInput && addressInput && typeof DANANG_WARDS !== 'undefined') {
    let foundDistrict = '';
    for (const district of Object.keys(DANANG_WARDS)) {
      if (EXISTING_ADDRESS_VAL.includes(district)) {
        foundDistrict = district;
        break;
      }
    }
    if (foundDistrict) {
      districtInput.value = foundDistrict;
      districtInput.classList.add('has-value');
      
      // Populate wards
      addressInput.innerHTML = '<option value="" disabled></option>';
      DANANG_WARDS[foundDistrict].forEach(ward => {
        const opt = document.createElement('option');
        opt.value = ward;
        opt.textContent = ward.split(',')[0].trim();
        if (EXISTING_ADDRESS_VAL.includes(ward)) {
          opt.selected = true;
          addressInput.classList.add('has-value');
        }
        addressInput.appendChild(opt);
      });
    }
  }

  // Dynamic Image Upload with Drag-and-Drop and Add-More List
  let selectedFiles = [];
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const addMoreBtn = document.getElementById('addMoreImagesBtn');
  const previewsContainer = document.getElementById('imagePreviewsContainer');
  const finalImagesInput = document.getElementById('finalImagesInput');
  const uploadGroup = document.getElementById('uploadGroup');

  if (uploadArea && fileInput && finalImagesInput) {
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
        uploadArea.style.borderColor = 'var(--color-primary)';
        uploadArea.style.backgroundColor = 'var(--color-primary-bg)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-border)';
        uploadArea.style.backgroundColor = 'var(--color-bg-subtle)';
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
      addMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
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
          uploadArea.style.backgroundColor = 'var(--color-success-bg)';
          uploadArea.style.borderColor = 'var(--color-success)';
          uploadContent.innerHTML = `
            <i class="bi bi-check-circle-fill text-success" style="font-size: 2.2rem; display: block; margin-bottom: 8px;"></i>
            <div class="upload-text text-success fw-semibold">Đã chọn ${selectedFiles.length} ảnh mới</div>
          `;
        } else {
          uploadArea.style.backgroundColor = 'var(--color-bg-subtle)';
          uploadArea.style.borderColor = 'var(--color-border)';
          uploadContent.innerHTML = initialUploadContentHTML;
        }
      }
    }

    function updateFinalInput() {
      const dt = new DataTransfer();
      selectedFiles.forEach(file => dt.items.add(file));
      finalImagesInput.files = dt.files;
    }

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

    input.type = 'text';
    input.inputMode = 'numeric';

    const updateValue = () => {
      const cursorSelectionStart = input.selectionStart;
      const originalLen = input.value.length;
      
      const formattedVal = formatNumberString(input.value);
      input.value = formattedVal;

      const newLen = input.value.length;
      let newCursorPos = cursorSelectionStart + (newLen - originalLen);
      input.setSelectionRange(newCursorPos, newCursorPos);
    };

    if (input.value) {
      input.value = formatNumberString(input.value);
    }

    input.addEventListener('input', updateValue);
  }

  setupFormattedInput('priceInput');
  setupFormattedInput('depositInput');
  setupFormattedInput('electricityPriceInput');
  setupFormattedInput('waterPriceInput');

  // Submit check (stripping format dots)
  form.addEventListener('submit', function (e) {
    const priceInput = document.getElementById('priceInput');
    if (priceInput) priceInput.value = priceInput.value.replace(/\D/g, '');
    const depositInput = document.getElementById('depositInput');
    if (depositInput) depositInput.value = depositInput.value.replace(/\D/g, '');
    const electricityPriceInput = document.getElementById('electricityPriceInput');
    if (electricityPriceInput) electricityPriceInput.value = electricityPriceInput.value.replace(/\D/g, '');
    const waterPriceInput = document.getElementById('waterPriceInput');
    if (waterPriceInput) waterPriceInput.value = waterPriceInput.value.replace(/\D/g, '');
  });

  // Initialize view
  updateStepsUI();
});
