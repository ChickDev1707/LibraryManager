const Reader = require('../../models/reader.js')
const BookRegistration = require('../../models/book-registration.js')
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const BookHead = require('../../models/book-head.js')

// get all book-registration
async function getAllBookRegistration(req, res){
    try{
        // delete overdue book-registration (3 day and not confirmed)
        deleteOverdueBookRegistrationFunction()

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
        let bookRegistration = await BookRegistration.findByIdAndRemove(req.params.id, {useFindAndModify: false}).exec();
        if(!bookRegistration)
        {
            // popup error message
        }
        res.redirect('/librarian/book-registration/')
    }catch{
        console.log(error)
        res.redirect('/librarian/book-registration/')
    }
}
// confirm book-registration = create-borrow-return card --> update book status --> delete book-registration
async function confirmBookRegistration(req, res){
    const id = req.params.id
    const readerId = req.params.readerId
    const bookHeadIds = req.params.bookHeadIds.split(',')
    
    try{
        for await (const bookHeadId of bookHeadIds){
            let bookHead = await BookHead.findById(bookHeadId)
            for await (const book of bookHead.cac_quyen_sach){
                if(book.tinh_trang == true) 
                {
                    // create borrow-return-card
                    let borrowReturnCard = new BorrowReturnCard({
                        ma_doc_gia: readerId,
                        ma_sach: book._id,
                        ngay_muon: null, 
                        ngay_tra: null,
                        so_ngay_tra_tre: 0,
                        tinh_trang: 0, // chưa lấy sách
                    })
                    let temp = await borrowReturnCard.save()

                    // update book status
                    updateBookStatusFunction(bookHeadId, book._id)

                    // update book-registration status
                    updateBookRegistrationStatusFunction(id)

                    //break loop
                    break
                }
            }
        }

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
    let temp = await BookHead.findOneAndUpdate(
        {_id: bookHeadId, "cac_quyen_sach._id": bookId},
        {
            "cac_quyen_sach.$.tinh_trang": false
        },
        {useFindAndModify: false}
    ).exec()
}

// update book-registration status function
async function updateBookRegistrationStatusFunction(id){
    let temp = await BookRegistration.findOneAndUpdate(id, {tinh_trang: true},{useFindAndModify: false}).exec()
}

// delete book-registration function
async function deleteBookRegistrationFunction(id){
    let temp = await BookRegistration.findByIdAndRemove(id, {useFindAndModify: false}).exec()
}

// delete overdue book-registration function
async function deleteOverdueBookRegistrationFunction(){
    let date = new Date();
    date.setDate(date.getDate()-3)

    // find book-registrations have status "false" and delete them
    let temp = await BookRegistration.find({ngay_dang_ky: {$lte: date}, tinh_trang: false}).deleteMany().exec()
}



