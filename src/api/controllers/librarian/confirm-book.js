const ConfirmBook=require('../../models/confirm-book-return')
const Reader=require('../../models/reader')

async function searchPhieuMuonTra(req,res){
    const allEmail=[]
    const reader=await Reader.find()
    for(let i=0;i<reader.length;i++){
        allEmail.push(reader[i].email)
    }

    let timKiemPhieuMuonTra=''

    //Tìm các giá trị duy nhất của email trong model phiếu mượn trả
    const confirm=await ConfirmBook.find()
    const arrMadocgia=[]
    confirm.forEach(element=>{
        arrMadocgia.push(element.ma_doc_gia)
    })
    
    let unique=arrMadocgia.filter((v,i,a)=>a.indexOf(v)===i)
    const arrEmail=[]
    const lengOfarrMadocgia=unique.length
    for(let i=0;i<lengOfarrMadocgia;i++){
        const r=await Reader.findById(unique[i])
        arrEmail.push(r.email)
    }

    //
    const timKiemDocGia=await Reader.find({"email":req.query.email})

    if(timKiemDocGia.toString()==''){
        res.render('librarian/confirm-book/index',{
            data:timKiemPhieuMuonTra,
            errorMessage:"Không có độc giả tìm thấy",
            emailValue:allEmail,
            emailPMT:arrEmail
        })
    }
    else{
        timKiemPhieuMuonTra=await ConfirmBook.find({ma_doc_gia:timKiemDocGia[0]._id})

        res.render('librarian/confirm-book/index',{
            data:timKiemPhieuMuonTra,
            errorMessage:"",
            emailValue:allEmail,
            emailPMT:arrEmail
        })
    }

}
async function themPhieuMuonTra(req,res){
    const findIdReader=await Reader.find({email:req.body.email})

    try{
        const data=new ConfirmBook({
            ma_doc_gia:findIdReader[0]._id,
            so_ngay_tra_ve:req.body.count
        })
        await data.save()
        
    }catch{

    }
    res.redirect('/librarian/xacnhantrasach')
}

async function xemKetQua(req,res){
    const data=req.body.hide.split(',')
    try{
        for(let i=0;i<data.length;i++){
            const confirm=await ConfirmBook.findById(data[i])
            await confirm.remove()
        }
    }catch{

    }

    res.redirect('/librarian/xacnhantrasach')

}


module.exports={
    searchPhieuMuonTra,
    themPhieuMuonTra,
    xemKetQua,
}