const mongoose = require('mongoose')
const path = require('path')
const bookChild = require('./book-child')
const coverImageBasePath = 'uploads/bookCovers'
const BookChild = require('./book-child')

const bookSchema = new mongoose.Schema({
    ten_dau_sach: {
        type: String, 
        required:true
    } ,
    the_loai:{
        type: String,
        required:true
    } ,
    tac_gia: {
        type: String, 
        required:true
    } ,
    nam_xuat_ban: {
        type:String,
        required: true
    },
    nha_xuat_ban: {
        type: String, 
        required: true
    },
    ngay_nhap: {
        type: Date,
        required: true, 
        default: Date.now
    },
    gia: {
        type: Number,
        required: true
    },
    anh_bia: {
        type: String, 
        required: true
    },
    so_luong: {
        type: Number, 
        required: true,
    },
    tom_tat: {
        type: String, 
        required: true
    },
    cac_quyen_sach:[bookChild],
    so_luong_kha_dung:{
        type: Number,
        required:true
    } 
})

// bookSchema.virtual('coverImagePath').get(function() {
//     if (this.coverImageName != null) {
//       return path.join('/', coverImageBasePath, this.coverImageName)
//     }
//   })
  
//   module.exports = mongoose.model('Book', bookSchema)
//   module.exports.coverImageBasePath = coverImageBasePath


module.exports = mongoose.model('Book', bookSchema, "DauSach")
module.exports.coverImageBasePath = coverImageBasePath