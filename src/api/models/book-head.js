const mongoose = require('mongoose')
const path = require('path')
const BookHeadSchema = new mongoose.Schema({
    ten_dau_sach:{
        type: String,
        required: true,
    },
    the_loai:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BookCategory'
    },
    tac_gia:{
        type: String,
        required: true,
    },
    nam_xuat_ban:{
        type: Number,
        required: true,
    },
    nha_xuat_ban:{
        type: String,
        required: true
    },
    ngay_nhap:{
        type: Date,
        required: true,
        default: Date.now
    },
    gia:{
        type: Number,
        required: true
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
    },
    so_luong_kha_dung:{
        type: Number,
        required: true
    },
    cac_quyen_sach: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        tinh_trang: {
            type: Boolean, // true: khả dụng (sẳn sàng cho mượn), fasle: không khả dụng( đã có người mượn rồi)
            required: true
        }
    }],
    cac_nhan_xet: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
})

module.exports = mongoose.model('BookHead', BookHeadSchema, "DauSach")
//module.exports.coverImageBasePath = coverImageBasePath