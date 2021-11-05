const mongoose = require('mongoose')
// const BookHead = require('../models/book-head.js')


const BorrowReturnCardSchema = new mongoose.Schema({
    ma_doc_gia:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reader'
    },
    ma_sach:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //ref: ''
    },
    ngay_muon:{
        type: Date,
        default: Date.now
    },
    ngay_tra:{
        type: Date,
        default: null
    },
    so_ngay_tra_tre:{
        type: Number
    },
    tinh_trang:{
        type: Number, //0: chưa lấy sách, 1: đã lấy sách, 2: đã trả sách
        required: true
    }
})

module.exports = mongoose.model('BorrowReturnCard', BorrowReturnCardSchema, 'PhieuMuonTra' )
