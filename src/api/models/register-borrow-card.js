const mongoose = require('mongoose')

const RegisterBorrowCard = new mongoose.Schema({
  doc_gia: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Reader'
  },
  ngay_dang_ky: {
    type: Date,
    required: true,
    default: Date.now
  },
  cac_dau_sach: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BookHead' }],
  tinh_trang:{
    type: Number, // 0 chưa cofirm, 1 đã confirm (chưa lấy sách), 2 bị từ chối (quá hạn/ bị thủ thư từ chối), 3 đăng ký thành công
    required: true,
    default: 0
  }
})

module.exports = mongoose.model('RegisterBorrowCard', RegisterBorrowCard, "PhieuDangKyMuonSach")