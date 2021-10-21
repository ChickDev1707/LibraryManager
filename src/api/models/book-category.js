const mongoose = require('mongoose')

const BookCategorySchema = new mongoose.Schema({
    ten_the_loai: {
        type: String, 
        required: true
    }
})

module.exports = mongoose.model('BookCategory', BookCategorySchema, 'TheLoaiSach' )