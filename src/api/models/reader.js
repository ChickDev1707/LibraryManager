const mongoose = require('mongoose')

const Reader= new mongoose.Schema({ 
    ho_ten:{
        type:String, 
        required:true, 
    },
    email:{
        type:String,
        require:true,
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
    id_account:{
        type:mongoose.Schema.Types.ObjectId,    
        require:true
    },
    tien_no:{
        type:Number,
        default: 0
    }
})


Reader.virtual('account', {
    ref: 'ReaderAccount',
    localField: 'email',
    foreignField: 'ten_tai_khoan',
    justOne: true
  })


module.exports =mongoose.model("Reader", Reader, "TheDocGia")