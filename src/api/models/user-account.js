
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
  lich_su_dk:{
    type: Array,
    default: []
  }
})

module.exports = mongoose.model('UseAccount', UseAccount, "TaiKhoan")