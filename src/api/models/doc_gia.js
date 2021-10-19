const mongoose = require('mongoose')

const docGia=new mongoose.Schema({ 
    ho_ten:{
        type:String, 
        required:true, 
    },
    email:{
        type:String,
        require:true
    },
    gioi_tinh:{
        type:String,
        require:true
    },
    ngay_sinh:{
        type:Date,
        require:true
    },
    dia_chi:{
        type:String,
        require:true
    },
    ngay_lap_the:{
        type:Date,
        require:true
    },

})

module.exports =mongoose.model("doc-gia",docGia)