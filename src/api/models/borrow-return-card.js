const mongoose=require('mongoose')


const BorrowReturnCard=new mongoose.Schema({
    ma_doc_gia:{
        type:String,
        require:true
    },
    ma_sach:{
        type:String,
        require:true
    },
    ngay_muon:{
        type:Date,
        require:true
    },
    ngay_tra:{
        type:Date,
        require:true
    },
    so_ngay_tra_tre:{
        type:Number,
        require:true
    },
    tinh_trang:{
        type:Number,
        require:true
    }
})

module.exports=mongoose.model("BorrowReturnCard",BorrowReturnCard,"phieumuontra" )