const mongoose = require('mongoose')

const BorrowReturnCardSchema = new mongoose.Schema({
    doc_gia:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reader'
    },
    dau_sach:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BookHead'
    },
    ma_sach:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    ngay_muon:{
        type: Date,
        required: true,
        default: Date.now
    },
    ngay_tra:{
        type: Date,
        default: null
    },
    so_ngay_tra_tre:{
        type: Number,
        required: true,
        default: 0
    },
    tinh_trang:{
        type: Number, //0: chưa lấy sách, 1: đã lấy sách, 2: đã trả sách
        required: true
    }
})

module.exports = mongoose.model('BorrowReturnCard', BorrowReturnCardSchema, 'PhieuMuonTra' )
