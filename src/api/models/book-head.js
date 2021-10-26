const mongoose = require('mongoose')

const BookHeadSchema = new mongoose.Schema({
    ma_dau_sach: {
        type: Number,
        required: true
    },
    ten_dau_sach:{
        type: String,
        required: true,
    },
    the_loai:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'TheLoaiSach'
    },
    tac_gia:{
        type: String
    },
    nam_xuat_ban:{
        type: Number
    },
    nha_xuat_ban:{
        type: String
    },
    ngay_nhap:{
        type: Date,
        required: true,
        default: Date.now
    },
    gia:{
        type: Number
    },
    so_luong:{
        type: Number,
        required: true
    },
    tom_tat:{
        type: String
    },
    anh_bia:{
        type: String
    }
})

module.exports = mongoose.model('BookHead', BookHeadSchema, "DauSach")