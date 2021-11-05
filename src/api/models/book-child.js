const mongoose = require('mongoose')

const bookChildSchema = new mongoose.Schema({
    tinh_trang: {
        type: Boolean,
        required: true
    }
})

module.exports = bookChildSchema