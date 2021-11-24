const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')
const manageReaderService=require('../../services/librarian/manage-reader-service')
const path=require('path')
const multer=require('multer')
const XLSX=require('xlsx')
const urlHelper=require('../../helpers/url')


const uploadPath = path.join('./src/public', '/uploads/addReader')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
const uploadReader = multer({ storage: storage })

async function getAllReader(req,res){
    const reader=await manageReaderService.searchReader(req.query.ho_ten)
    res.render('librarian/manage-reader/all.ejs',{
        reader:reader,
        search:req.query,
    })
}
async function addReader(req,res){
    if(req.file){
        await manageReaderService.handleAddFileExcel(req.file)
        res.redirect('/librarian/reader')
    }
    else{
        const data=await manageReaderService.handleAddReader(req.body)
        
        try {
            const newreader= await data.reader.save()
            const newAccount=await data.addAccount.save()
            const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
                type:'success',
                message:"Tạo độc giả thành công"
            })
            res.redirect(redirectUrl)
        } catch (error) {
            // console.log(error)
            const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
                type:'error',
                message:data.errorMessage
            })
            res.redirect(redirectUrl)
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
    const redirectUrl=await manageReaderService.handleEditReader(req.params,req.body)
    res.redirect(redirectUrl)

}
async function deleteReader(req,res){
    try {
        await manageReaderService.handleDeleteReader(req.params.id) 
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
            type:'success',
            message:"Xóa độc giả thành công"
        })
        res.redirect(redirectUrl)
    } catch (error) {
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/reader/',{
            type:'error',
            message:"Không xóa được"
        })
        res.redirect(redirectUrl)
    }
}
module.exports={
    getAllReader,
    addReader,
    getReader,
    formEditReader,
    editReader,
    deleteReader,
    uploadReader
}