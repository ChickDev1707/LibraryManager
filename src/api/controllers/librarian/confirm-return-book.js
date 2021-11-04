const BorrowReturnCard=require('../../models/borrow-return-card')
const Reader=require('../../models/reader')
const Book=require('../../models/book')

const servicesConfirmReturnBook=require('../../services/librarian/confirm-book-return-services')



async function getConfirmReturnBook(req,res){

    let kq={
        allBorrowReturnCard:[],
        allNameReader:[]
    }
    if(req.query.email=='' || req.query.email==null){
        try{
            kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.handleEmptyEmail()))       
            res.render('librarian/confirm-book/view-confirm-return-book',{
                borrowReturnCard:kq.allBorrowReturnCard,
                allNameReader:kq.allNameReader
            })
        }catch(e){
            console.log(e)
        }
    }
    else{
        try{
            kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.handleHasEmail(req.query.email)))
            res.render('librarian/confirm-book/view-confirm-return-book',{
                borrowReturnCard:kq.allBorrowReturnCard,
                allNameReader:kq.allNameReader
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
        allNameReader:[]
    }
    try{
        kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.confirmCard(confirmReturnBook)))
        res.render('librarian/confirm-book/view-confirm-return-book',{
            borrowReturnCard:kq.allBorrowReturnCard,
            allNameReader:kq.allNameReader
        })
    }catch{
        kq=JSON.parse(JSON.stringify(await servicesConfirmReturnBook.unConfirmCard()))

        res.render('librarian/confirm-book/view-confirm-return-book',{
            borrowReturnCard:kq.allBorrowReturnCard,
            allNameReader:kq.allNameReader
        })
    }
}

module.exports={

    getConfirmReturnBook,
    putConfirmReturnBook
}