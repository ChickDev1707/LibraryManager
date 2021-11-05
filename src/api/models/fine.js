const mongoose = require('mongoose')

const fineSchema = new mongoose.Schema({
    doc_gia: {
        type: mongoose.SchemaTypes.ObjectId,
        require: true,
        ref: "Reader"
    },
    so_tien_thu:{
        type: Number,
        require: true,
    },
    ngay_thu:{
        type: Date,
        require: true,
        default: Date.now
    },
    con_lai: {
        type: Number, 
        require:true
    }
})


module.exports = mongoose.model('Fine', fineSchema, "PhieuThuTienPhat")