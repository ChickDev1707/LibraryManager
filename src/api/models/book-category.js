const mongoose = require('mongoose')

const bookCategorySchema = new mongoose.Schema({
    ten_the_loai: {
        type: String, 
        required: true
    }
})

module.exports = mongoose.model('bookCategory',bookCategorySchema, 'TheLoaiSach' )