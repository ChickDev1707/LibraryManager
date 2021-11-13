const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')
const manageReaderService=require('../../services/librarian/manage-reader-service')
const excelToJson = require('convert-excel-to-json');
const fs=require('fs')
const path=require('path')
async function getAllReader(req,res){

    const reader=await manageReaderService.searchReader(req.query.ho_ten)
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

    if(req.file){
        const uploadPath = path.join('./src/public/uploads/addReader',req.file.originalname+'')

        const result=excelToJson({
            sourceFile:uploadPath,
            header:{
                rows:1
            },
            columnToKey:{
                A:'stt',
                B:'ho_ten',
                C:'ngay_sinh',
                D:'dia_chi',
                E:'email',
                F:'gioi_tinh'
            }
        })
        const length=result.Reader.length;
        for(let i=0;i<length;i++){
            const nam_sinh=new Date(result.Reader[i].ngay_sinh)
            const today=new Date()
            const checkAge=today.getFullYear()-nam_sinh.getFullYear()

            try{
                const validAccount=await Account.find({ten_tai_khoan:result.Reader[i].email})
                //check ràng buộc
                if(validAccount.length!=0){
                    continue;
                }
                if(checkAge<18||checkAge>55){
                    continue;
                }
                //
                const account=new Account({
                    ten_tai_khoan:result.Reader[i].email,
                    vai_tro:"reader",
                    mat_khau:"reader"
                })
                // break;
                await account.save()

                const today=new Date()
                const month=((today.getMonth()+1)<10)?('0'+(today.getMonth()+1)):(today.getMonth()+1)
                const day=(today.getDate()<10)?('0'+today.getDate()):(today.getDate())
                const ngay_lap_the=today.getFullYear()+'-'+month+'-'+day

                console.log("ngay lap the",ngay_lap_the,"ngay sinh : ", result.Reader[i].ngay_sinh)

                try{
                    const reader=new Reader({
                        ho_ten:result.Reader[i].ho_ten,
                        email:result.Reader[i].email,
                        gioi_tinh:result.Reader[i].gioi_tinh,
                        ngay_sinh:result.Reader[i].ngay_sinh,
                        dia_chi:result.Reader[i].dia_chi,
                        ngay_lap_the:ngay_lap_the,
                        id_account:account._id
                    })
                    await reader.save()
                }catch{
                    console.log("ko tao duoc reader")
                }
            }catch{
                try{
                    const account =await Account.find({ten_tai_khoan:result.Reader[i].email})
                    await account.remove()
                }catch{

                }
            }
        } 
        fs.unlink(uploadPath,function(err){
            if(err) throw err
            console.log('file delete!')
        })
        res.redirect('/librarian/reader')
    }else{
        const data=await manageReaderService.handleAddReader(req.body)
        try {
        const newreader= await data.reader.save()
        const newAccount=await data.addAccount.save()
        res.redirect('/librarian/reader')
        } catch (error) {
            res.render('librarian/manage-reader/new',{
                reader:data.reader,
                errorMessage:data.errorMessage
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
    const Data=await manageReaderService.editReader(req.params)
    res.render('librarian/manage-reader/edit',{
      reader:Data,
      error:'',
    })
} 
async function editReader(req,res){
    const Data=await manageReaderService.handleEditReader(req.params,req.body)
    if(Data.error!=''){
        res.render('librarian/manage-reader/edit',{
            reader:Data.data,
            error:Data.error
        })
    }else{
        res.redirect('/librarian/reader')
    }
}
async function deleteReader(req,res){
    try {
        await manageReaderService.handleDeleteReader(req.params.id) 
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