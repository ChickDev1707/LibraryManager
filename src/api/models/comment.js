const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    doc_gia: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reader'
    },
    noi_dung: {
        type: String,
        required: true
    },
    ngay_dang:{
        type: Date,
        required: true,
        default: Date.now()
    },
    sao_danh_gia:{
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Comment', CommentSchema, "NhanXet")