const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/bookCovers'
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
    bf_anh_bia:{
        type: Buffer,
    },
    kieu_anh_bia: {
        type: String,
        required: true
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
    cac_nhan_xet: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    sao_danh_gia:{
        type: Number,
        required: true,
        default: 0
    }
})


BookHeadSchema.virtual('anh_bia').get(function() {
    if (this.bf_anh_bia != null && this.kieu_anh_bia != null) {
      return `data:${this.kieu_anh_bia};charset=utf-8;base64,${this.bf_anh_bia.toString('base64')}`
    }
})

module.exports = mongoose.model('BookHead', BookHeadSchema, "DauSach")