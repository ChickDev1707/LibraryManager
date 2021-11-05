const mongoose = require('mongoose')

const readerAcountSchemal = new mongoose.Schema({
    ten_tai_khoan: {
        type: String,
        required: true
    },
    mat_khau: {
        type: String,
        require: true,
       
    },
    vai_tro: {
        type: String,
        require: true,
        default: "reader"
    },
    gio_sach: {
        type: Array,
        require: true,
        default: []
    },
    lich_su_dk: {
        type: Array,
        require: true, 
        default: []
    }

})

module.exports = mongoose.model("ReaderAccount", readerAcountSchemal, "TaiKhoanDocGia")