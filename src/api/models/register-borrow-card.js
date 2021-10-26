const mongoose = require('mongoose')

const RegisterBorrowCard = new mongoose.Schema({
  ma_doc_gia: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'TheDocGia'
  },
  ngay_dang_ky: {
    type: Date,
    required: true,
    default: Date.now
  },
  cac_dau_sach:{
    type: Array,
    required: true,
  }
})

module.exports = mongoose.model('RegisterBorrowCard', RegisterBorrowCard, "PhieuDangKyMuonSach")