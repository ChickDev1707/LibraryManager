const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')

async function getAllReader(req,res){
    const search={}
    if(req.query.ho_ten!=null || req.query.ho_ten!=""){
      search.ho_ten=new RegExp(req.query.ho_ten,"i")
    }
    const reader=await Reader.find(search)
    res.render('librarian/manage-reader/all.ejs',{
      reader:reader,
      search:req.query
    })
}

function newReader(req,res){
    res.render('librarian/manage-reader/new.ejs',{
        reader:new Reader(),
        errorMessage:""
    })
}

async function addReader(req,res){
    const nam_sinh=new Date(req.body.ngay_sinh)
    const today=new Date()
    const checkAge=today.getFullYear()-nam_sinh.getFullYear()

    const checkEmail=await Reader.find({"email":req.body.email})

    let reader=""

    if(req.body.ho_ten==""||
        req.body.email==""||
        req.body.gioi_tinh==""||
        req.body.ngay_sinh==""||
        req.body.dia_chi==""||
        req.body.ngay_lap_the==""
    ){
        res.render('librarian/manage-reader/new',{
            reader:reader,
            errorMessage:"Thiếu thông tin"
        })
    }
    else if(checkAge<18){
        res.render('librarian/manage-reader/new',{
            reader:reader,
            errorMessage:"Không đủ tuổi đăng ký"
        })
    }
    else if(checkAge>55){
        res.render('librarian/manage-reader/new',{
            reader:reader,
            errorMessage:"Vượt quá độ tuổi đăng ký"
        })
    }
    else if(checkEmail.toString()!=''){
        res.render('librarian/manage-reader/new',{
            reader:reader,
            errorMessage:"Email đã được sử dụng!!!"
        })
    }
    else{
        const addAccount=new Account({
            ten_tai_khoan:req.body.email,
            mat_khau:"reader",
            vai_tro:"reader",
        })

        reader=new Reader({
            ho_ten:req.body.ho_ten,
            email:req.body.email,
            gioi_tinh:req.body.gioi_tinh,
            ngay_sinh:req.body.ngay_sinh,
            dia_chi:req.body.dia_chi,
            ngay_lap_the:req.body.ngay_lap_the,
            id_account:addAccount.id,
        })
        try {

        const newreader= await reader.save()
        const newAccount=await addAccount.save()
        res.redirect('/librarian/reader')
        } catch (error) {
            res.render('librarian/manage-reader/new',{
                reader:reader,
                errorMessage:""
            })
        }
    
    }

}

async function getReader(req,res){
    try {
        const reader=await Reader.findById(req.params.id)
        res.render('librarian/manage-reader/view',{reader:reader})
    } catch (error) {
        
    }
}

async function formEditReader(req,res){
    const reader= await Reader.findById(req.params.id)

    const Data={
      id:reader.id,
      ho_ten:reader.ho_ten,
      email:reader.email,
      gioi_tinh:reader.gioi_tinh,
      ngay_sinh:reader.ngay_sinh.toISOString().split('T')[0],
      dia_chi:reader.dia_chi,
      ngay_lap_the:reader.ngay_lap_the.toISOString().split('T')[0],
  }
  res.render('librarian/manage-reader/edit',{
      reader:Data,
      error:'',
  })
} 

async function editReader(req,res){
    const nam_sinh=new Date(req.body.ngay_sinh)
    const today=new Date()
    const checkAge=today.getFullYear()-nam_sinh.getFullYear()

    let reader= await Reader.findById(req.params.id)

    const account=await Account.findById(reader.id_account)

    const checkEmail=await Reader.find({"email":req.body.email})


    const Data={
        id:reader.id,
        ho_ten:reader.ho_ten,
        email:reader.email,
        gioi_tinh:reader.gioi_tinh,
        ngay_sinh:reader.ngay_sinh.toISOString().split('T')[0],
        dia_chi:reader.dia_chi,
        ngay_lap_the:reader.ngay_lap_the.toISOString().split('T')[0],
    }
    if(req.body.ho_ten==""||
        req.body.email==""||
        req.body.gioi_tinh==""||
        req.body.ngay_sinh==""||
        req.body.dia_chi==""||
        req.body.ngay_lap_the==""
    ){
        res.render('librarian/manage-reader/edit',{
            reader:Data,
            error:"Thiếu thông tin"
        })
    }
    else if(checkAge<18){
        res.render('librarian/manage-reader/edit',{
            reader:Data,
            error:"Không đủ độ tuổi"
        })
    }
    else if(checkAge>55){
        res.render('librarian/manage-reader/edit',{
            reader:Data,
            error:"Vượt quá tuổi đăng ký"
        })
    }
    else if(checkEmail.toString()!='' ){
        if(checkEmail[0]._id != req.params.id){
            res.render('librarian/manage-reader/edit',{
                reader:Data,
                error:"Email đã đăng ký"
            })
        }
        else{
            reader.ho_ten=req.body.ho_ten
            reader.email=req.body.email
            reader.gioi_tinh=req.body.gioi_tinh
            reader.ngay_sinh=req.body.ngay_sinh
            reader.dia_chi=req.body.dia_chi
            reader.ngay_lap_the=req.body.ngay_lap_the
            await reader.save()
            
            account.ten_tai_khoan=req.body.email
            await account.save()
            
            res.redirect('/librarian/reader')     
        }
    }
    else{  
        reader.ho_ten=req.body.ho_ten
        reader.email=req.body.email
        reader.gioi_tinh=req.body.gioi_tinh
        reader.ngay_sinh=req.body.ngay_sinh
        reader.dia_chi=req.body.dia_chi
        reader.ngay_lap_the=req.body.ngay_lap_the
        await reader.save()

        account.ten_tai_khoan=req.body.email
        await account.save()
        
        res.redirect('/librarian/reader')   

    }
}

async function deleteReader(req,res){
    try {
        const reader= await Reader.findById(req.params.id)
        const readerAccount=await Account.findById(reader.id_account)

        await reader.remove()
        await readerAccount.remove()

        const borrowReturnCard=await BorrowReturnCard.find({ma_doc_gia:req.params.id})
        const length=borrowReturnCard.length
        for(let i=0;i<length;i++){
            await borrowReturnCard[i].remove()          //xóa phiếu mượn trả của độc giả 
        }
        

        
        res.redirect('/librarian/reader')
    } catch (error) {
        res.redirect('/librarian/reader')
    }
}

module.exports={
    getAllReader,
    newReader,
    addReader,
    getReader,
    formEditReader,
    editReader,
    deleteReader
}