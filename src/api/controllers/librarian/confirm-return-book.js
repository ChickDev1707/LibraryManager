const BorrowReturnCard=require('../../models/borrow-return-card')
const Reader=require('../../models/reader')
const Book=require('../../models/book')
async function getBorrowCard(req,res){
    res.render('librarian/confirm-book/view-form-borrow-card')
}

async function postBorrowCard(req,res){
    const dataFormBorrowReturnCard=new BorrowReturnCard({
        ma_doc_gia:req.body.ma_doc_gia,
        ma_sach:req.body.ma_sach,
        ngay_muon:req.body.ngay_muon,
        ngay_tra:'',
        so_ngay_tra_tre:'',
        tinh_trang:1
    })
    try{
        await dataFormBorrowReturnCard.save()
        res.render('librarian/confirm-book/view-form-borrow-card')
    }
    catch(e){
        console.log(e)
        res.render('librarian/confirm-book/view-form-borrow-card')
    }

}

async function getConfirmReturnBook(req,res){
    let allBorrowReturnCard=''
    if(req.query.email=='' || req.query.email==null){
        allBorrowReturnCard=await BorrowReturnCard.find({tinh_trang:1})
        res.render('librarian/confirm-book/view-confirm-return-book',{
            borrowReturnCard:allBorrowReturnCard
        })
    }
    else{
        try{
            const search={}
            search.email=new RegExp(req.query.email,'i')

            const reader=await Reader.find({email:search.email})
            allBorrowReturnCard=await BorrowReturnCard.find({ma_doc_gia:reader[0]._id,tinh_trang:1})
    
            res.render('librarian/confirm-book/view-confirm-return-book',{
                borrowReturnCard:allBorrowReturnCard
            })
        }
        catch{
            res.render('librarian/confirm-book/view-confirm-return-book',{
                borrowReturnCard:allBorrowReturnCard
            })
        }
    }
}

async function putConfirmReturnBook(req,res){
    const confirmReturnBook=req.body.selectBorrowReturnCard.split(',');

    const today=new Date()
    const month=((today.getMonth()+1)<10)?('0'+(today.getMonth()+1)):(today.getMonth()+1)
    const ngay_tra=today.getFullYear()+'-'+month+'-'+today.getDate() 

    /*
        -So_ngay_tra_tre>30 sẽ bị phạt
        -sử dụng parseInt((date2.getTime()-date1.getTime())/(24*3600*1000)) để tính bao nhiêu ngày từ date2 ->date1
    */
    
    const lengOfConfirmBook=confirmReturnBook.length

    try{

        for(let i=0;i<lengOfConfirmBook;i++){
            const card=await BorrowReturnCard.findById(confirmReturnBook[i])

            card.ngay_tra=ngay_tra
            card.so_ngay_tra_tre=tinh_ngay_tra_tre(today,card.ngay_muon)
            card.tinh_trang=2
            //cộng vào tiền nợ nếu có và thay đổi số lượng khả dụng của đầu sách
            try{
                if(card.so_ngay_tra_tre>0){
                    const reader=await Reader.findById(card.ma_doc_gia)
                    reader.tien_no=card.so_ngay_tra_tre*1000
                    await reader.save()
                }
                const book=await Book.findById(card.ma_sach)
                book.so_luong_kha_dung=book.so_luong_kha_dung+1
                await book.save()
            }catch{

            }
            //
            await card.save()
        }
        const allBorrowReturnCard=await BorrowReturnCard.find({tinh_trang:1})
        res.render('librarian/confirm-book/view-confirm-return-book',{
            borrowReturnCard:allBorrowReturnCard
        })
    }catch{
        res.render('librarian/confirm-book/view-confirm-return-book',{
            borrowReturnCard:''
        })
    }
}

function tinh_ngay_tra_tre(ngay_tra,ngay_muon){

    const so_ngay_tra_tre=parseInt((ngay_tra.getTime()-ngay_muon.getTime())/(24*3600*1000))

    if(so_ngay_tra_tre>30){
        return so_ngay_tra_tre-30
    }
    else{
        return 0
    }
}

module.exports={
    getBorrowCard,
    postBorrowCard,
    getConfirmReturnBook,
    putConfirmReturnBook
}