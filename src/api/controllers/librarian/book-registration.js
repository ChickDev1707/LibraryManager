const Reader = require('../../models/reader.js')
const BookRegistration = require('../../models/book-registration.js')
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const BookHead = require('../../models/book-head.js')

// get all book-registration
async function getAllBookRegistration(req, res){
    try{
        // delete overdue book-registration (over 3 days and not confirmed)
        await deleteOverdueBookRegistrationFunction()

        //get all book-registration
        const bookRegistration = await BookRegistration.find({tinh_trang: false})
        .populate('ma_doc_gia')
        .populate('cac_dau_sach')
        .sort({ngay_dang_ky: 1})
        .exec()

        res.render('librarian/book-registration/all', {
            bookRegistration: bookRegistration
        })
    }catch{
        console.log(error)
        res.redirect('/librarian/book-registration')
    }
}

// delete book-registration
async function deleteBookRegistration(req, res){
    try{
        //update quantity available of book-head
        let bookRegistration = await BookRegistration.findById(req.params.id)
        for await(const bookHeadId of bookRegistration.cac_dau_sach){
            let bookHead = await BookHead.findOneAndUpdate({_id: bookHeadId}, {$inc: {so_luong_kha_dung: 1} }, {useFindAndModify: false})
        }

        //delete book-registration
        await BookRegistration.findByIdAndRemove(req.params.id, {useFindAndModify: false}).exec();

        res.redirect('/librarian/book-registration/')
    }catch{
        console.log(error)
        res.redirect('/librarian/book-registration/')
    }
}
// confirm book-registration = create-borrow-return card --> update book status --> update book-registration status
async function confirmBookRegistration(req, res){
    const bookRegistration = await BookRegistration.findById(req.params.bookRegistrationId)
    try{
        for await (const bookHeadId of bookRegistration.cac_dau_sach){
            let bookHead = await BookHead.findById(bookHeadId)
            for await (const book of bookHead.cac_quyen_sach){
                if(book.tinh_trang == true){ 
                    // create borrow-return-card
                    let borrowReturnCard = new BorrowReturnCard({
                        ma_doc_gia: bookRegistration.ma_doc_gia,
                        ma_sach: book._id,
                        ngay_muon: null, 
                        ngay_tra: null,
                        so_ngay_tra_tre: 0,
                        tinh_trang: 0, // chưa lấy sách
                    })
                    await borrowReturnCard.save()

                    // update book status
                    updateBookStatusFunction(bookHeadId, book._id)

                    break
                }
            }
        }
        // update book-registration status
        updateBookRegistrationStatusFunction(req.params.bookRegistrationId)

        res.redirect('/librarian/book-registration/')
    }catch{
        res.redirect('/librarian/book-registration')
        console.log(error) 
    }

}

module.exports = {
    getAllBookRegistration,
    deleteBookRegistration,
    confirmBookRegistration
}

/*========subfunction========*/
// update book status function
async function updateBookStatusFunction(bookHeadId, bookId){
    await BookHead.findOneAndUpdate(
        {_id: bookHeadId, "cac_quyen_sach._id": bookId},
        {
            "cac_quyen_sach.$.tinh_trang": false
        },
        {useFindAndModify: false}
    ).exec()
}

// update book-registration status function
async function updateBookRegistrationStatusFunction(bookRegistrationId){
    await BookRegistration.findOneAndUpdate({_id: bookRegistrationId}, {tinh_trang: true}, {useFindAndModify: false})
}

// delete overdue book-registration function (over 3 days and not confirmed)
async function deleteOverdueBookRegistrationFunction(){
    let date = new Date();
    date.setDate(date.getDate()-3)

    //update all quantity available of book-head before delete overdue book-registration
    let bookRegistrations = await BookRegistration.find({ngay_dang_ky: {$lte: date}, tinh_trang: false})

    for await (const bookRegistration of bookRegistrations){
        for await (const bookHeadId of bookRegistration.cac_dau_sach){
            await BookHead.findOneAndUpdate({_id: bookHeadId}, {$inc: {so_luong_kha_dung: 1} }, {useFindAndModify: false})
        }
    }

    // delete all overdue book-registration
    await BookRegistration.find({ngay_dang_ky: {$lte: date}, tinh_trang: false}).deleteMany().exec()

}



