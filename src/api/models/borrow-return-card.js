const mongoose = require('mongoose')

const BorrowReturnCardSchema = new mongoose.Schema({
    doc_gia:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reader'
    },
    dau_sach:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BookHead'
    },
    ma_sach:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    ngay_muon:{
        type: Date,
        default: Date.now
    },
    ngay_tra:{
        type: Date,
        default: null
    },
    so_ngay_tra_tre:{
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('BorrowReturnCard', BorrowReturnCardSchema, 'PhieuMuonTra' )
