const mongoose=require('mongoose')


const ConfirmBookReturn=new mongoose.Schema({
    // ma_phieu_muon_tra:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     require:true
    // },
    ma_doc_gia:{
        type:String,
        require:true
    },
    // ma_sach:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     require:true
    // },
    // ngay_muon:{
    //     type:Date,
    //     require:true
    // },
    // ngay_tra:{
    //     type:Date,
    //     require:true
    // },
    so_ngay_tra_ve:{
        type:Number,
        require:true
    }
})

module.exports=mongoose.model("ConfirmBookReturn",ConfirmBookReturn )