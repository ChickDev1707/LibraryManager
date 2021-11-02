const mongoose = require('mongoose')

const BorrowReturnCardSchema = new mongoose.Schema({
  ma_doc_gia: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'TheDocGia'
  },
  ma_sach: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  ngay_muon:{
    type: Date,
    required: true,
  },
  ngay_tra:{
    type: Date,
    default: null
  },
  so_ngay_tra_tre:{
    type: Number,
    require: true
  },
  tinh_trang: {
    type: Number,
    require: true
  }
})

module.exports = mongoose.model('BorrowReturnCard', BorrowReturnCardSchema, "PhieuMuonTra")