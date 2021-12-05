
const mongoose = require('mongoose')

const UseAccount = new mongoose.Schema({
  ten_tai_khoan: {
    type: String,
    require: true
  },
  mat_khau: {
    type: String,
    require: true
  },
  vai_tro:{
    type: String,
    require: true
  },
  gio_sach:{
    type: Array,
    default: []
  },
  sach_yeu_thich:{
    type:Array,
    default:[]
  },
  thong_bao: {
    type: [{
      tieu_de:{
        type: String,
        required: true
      },
      noi_dung: {
        type: String,
        required: true
      },
      ngay:{
        type: Date,
        default: Date.now()
      }
    }],
    default: []
  },
  thong_bao_moi:{
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('UseAccount', UseAccount, "TaiKhoan")