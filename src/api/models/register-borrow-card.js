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
    type: Number,
    required: true,
    default: false
  }
})

module.exports = mongoose.model('RegisterBorrowCard', RegisterBorrowCard, "PhieuDangKyMuonSach")