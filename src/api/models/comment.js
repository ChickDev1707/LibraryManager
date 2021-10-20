const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    ma_doc_gia: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reader'
    },
    ma_dau_sach:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BookHead'
    },
    noi_dung: {
        type: String,
        required: true
    },
    ngay_dang:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Comment', CommentSchema)