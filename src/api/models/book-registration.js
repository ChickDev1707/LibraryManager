const mongoose = require('mongoose')
// const BookHead = require('../models/book-head.js')


const BookRegistrationSchema = new mongoose.Schema({
    ma_doc_gia:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reader'
    },
    ngay_dang_ky:{
        type: Date,
        required: true,
        default: Date.now
    },
    cac_dau_sach:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookHead'
    }],
    tinh_trang:{
        type: Boolean, // true: đã confirm, false: chưa confirm
        required: true
    }
})

module.exports = mongoose.model('BookRegistration', BookRegistrationSchema, 'PhieuDangKyMuonSach' )