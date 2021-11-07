const Reader=require('../../models/reader')
const Account=require('../../models/user-account')
const BorrowReturnCard=require('../../models/borrow-return-card')
const manageReaderService=require('../../services/librarian/manage-reader-service')

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