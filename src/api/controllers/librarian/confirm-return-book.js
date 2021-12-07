const BorrowReturnCard=require('../../models/borrow-return-card')
const Reader=require('../../models/reader')
const Book=require('../../models/book-head')
const urlHelper=require('../../helpers/url')

const servicesConfirmReturnBook=require('../../services/librarian/confirm-book-return-services')

async function getConfirmReturnBook(req,res){
    let kq={
        allBorrowReturnCard:[],
        allNameReader:[],
        allEmailReader:[]
    }
    if(req.query.email=='' || req.query.email==null){
        try{
            kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.handleEmptyEmail()))       
            res.render('librarian/confirm-book/view-confirm-return-book',{
                borrowReturnCard:kq.allBorrowReturnCard,
                allNameReader:kq.allNameReader,
                allEmailReader:kq.allEmailReader
            })
        }catch(e){
            
        }
    }
    else{
        try{
            kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.handleHasEmail(req.query.email)))
            res.render('librarian/confirm-book/view-confirm-return-book',{
                borrowReturnCard:kq.allBorrowReturnCard,
                allNameReader:kq.allNameReader,
                allEmailReader:kq.allEmailReader
            })
        }
        catch(e){
            console.log(e)
        }
    }
}

async function putConfirmReturnBook(req,res){
    const confirmReturnBook=req.body.selectBorrowReturnCard.split(',');
    let kq={
        allBorrowReturnCard:[],
        allNameReader:[],
        allEmailReader:[]
    }
    try{
        kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.confirmCard(confirmReturnBook)))
        
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/confirm-return-book/',{
            type:'success',
            message:"Đã xác nhận các phiếu mượn thành công"
        })
        res.redirect(redirectUrl)

        // res.render('librarian/confirm-book/view-confirm-return-book',{
        //     borrowReturnCard:kq.allBorrowReturnCard,
        //     allNameReader:kq.allNameReader
        // })
    }catch(e){
        console.log(e)
        kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.unConfirmCard()))
        
        const redirectUrl=urlHelper.getEncodedMessageUrl('/librarian/confirm-return-book/',{
            type:'error',
            message:"Không thể xác nhận "
        })
        res.redirect(redirectUrl)

    }
}

module.exports={

    getConfirmReturnBook,
    putConfirmReturnBook
}