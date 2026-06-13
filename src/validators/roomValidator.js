const { ROOM_STATUS_TYPES } = require('../constants');

const validateRoom = (req, res, next) => {
  const { title, area, price, address, description, deposit, status, phone, depositMonth, electricityPrice, waterPrice } = req.body;
  const isEdit = req.originalUrl.includes('/edit');

  const renderError = (errorMessage) => {
    if (isEdit) {
      return res.render('admin/room/editroom', {
        title: 'Chỉnh sửa phòng trọ',
        user: req.session.user,
        room: { id: req.params.id, ...req.body },
        error: errorMessage
      });
    } else {
      return res.render('admin/room/newrooms', {
        title: 'Thêm phòng mới',
        user: req.session.user,
        error: errorMessage
      });
    }
  };

  if (!address) {
    return renderError('Vui lòng chọn địa chỉ phòng trọ.');
  }

  if (!area || Number(area) <= 0) {
    return renderError('Diện tích phải là số dương lớn hơn 0.');
  }

  if (!price || Number(price) <= 0) {
    return renderError('Giá thuê phải là số dương lớn hơn 0.');
  }

  if (deposit && Number(deposit) < 0) {
    return renderError('Số tiền đặt cọc không được là số âm.');
  }

  if (depositMonth && Number(depositMonth) < 0) {
    return renderError('Số tháng cọc trước không được là số âm.');
  }

  if (electricityPrice && Number(electricityPrice) < 0) {
    return renderError('Tiền điện không được là số âm.');
  }

  if (waterPrice && Number(waterPrice) < 0) {
    return renderError('Tiền nước không được là số âm.');
  }

  if (!phone || !/^0[35789]\d{8}$/.test(phone.trim())) {
    return renderError('Số điện thoại không hợp lệ.');
  }

  if (!status || !ROOM_STATUS_TYPES.includes(status)) {
    return renderError('Loại phòng không hợp lệ (chọn Ở đơn hoặc Ở ghép).');
  }

  if (!title || title.trim().length < 10 || title.trim().length > 70) {
    return renderError('Tiêu đề tin đăng phải từ 10 đến 70 ký tự.');
  }

  if (!description || description.trim().length < 30) {
    return renderError('Mô tả phòng phải dài ít nhất 30 ký tự.');
  }

  next();
};

module.exports = {
  validateRoom
};
