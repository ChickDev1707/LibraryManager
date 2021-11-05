const mongoose = require('mongoose')

const CallCardSchema = new mongoose.Schema({
    ma_doc_gia: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "Reader"
    },
    dau_sach: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book"
    },
    ma_sach: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    ngay_muon: {
        type: mongoose.Schema.Types.Date,
        require: true,
        default: Date.now
    },
    ngay_tra: {
        type: mongoose.Schema.Types.ObjectId,
    },
    so_ngay_tre: {
        type: mongoose.Schema.Types.Number
    },
    tinh_trang:{
        type: Number,
        require: true
    }
})


module.exports = mongoose.model("CallCard", CallCardSchema, "PhieuMuonTra")