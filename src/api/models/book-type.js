const mongoose = require('mongoose')

const BookTypeSchema = new mongoose.Schema({
    ma_the_loai: {
        type: Number,
        required: true
    },
    ten_the_loai: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('BookType', BookTypeSchema, "TheLoaiSach")