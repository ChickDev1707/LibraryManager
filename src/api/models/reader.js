const mongoose = require('mongoose')

const ReaderSchema = new mongoose.Schema({
    ma_doc_gia: {
        type: Number,
        required: true
    },
    ho_ten: {
        type: String,
        required: true
    },
    email:{
        type:String,
        require:true
    },
    gioi_tinh:{
        type:String,
        required: true
    },
    ngay_sinh:{
        type:Date,
        required: true,
        default: Date.now
    },
    dia_chi:{
        type:String,
        required: true
    },
    ngay_lap_the:{
        type:Date,
        required: true,
        default: Date.now
    },
    tien_no:{
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('Reader', ReaderSchema)
