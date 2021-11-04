const Reader = require('../../models/reader.js')
const BookRegistration = require('../../models/book-registration.js')
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const BookHead = require('../../models/book-head.js');
const bookHead = require('../../models/book-head.js');

// delete overdue book-registration
async function deleteOverdueBookRegistration(){
    let date = new Date();
    date.setDate(date.getDate()-3)
    //update all quantity available of book-head before delete overdue book-registration
    let bookRegistrations = await BookRegistration.find({ngay_dang_ky: {$lte: date}, tinh_trang: false})
    for await (const bookRegistration of bookRegistrations){
        for await (const bookHeadId of bookRegistration.cac_dau_sach){
            const filter = {_id: bookHeadId}
            const update = {$inc: {so_luong_kha_dung: 1}}
            await BookHead.findOneAndUpdate(filter, update, {useFindAndModify: false})
        }
    }
    // delete all overdue book-registration
    const filter = {ngay_dang_ky: {$lte: date}, tinh_trang: false}
    await BookRegistration.find(filter).deleteMany().exec()
}

//get all book-registration
async function getAllBookRegistration(){
    let bookRegistration = await BookRegistration.find({tinh_trang: false})
        .populate('ma_doc_gia')
        .populate('cac_dau_sach')
        .sort({ngay_dang_ky: 1})
        .exec()
    return bookRegistration
}

// delete book-registration
async function deleteBookRegistration(bookRegistrationId){
    //update quantity available of book-head
    let bookRegistration = await BookRegistration.findById(bookRegistrationId)
    for await(const bookHeadId of bookRegistration.cac_dau_sach){
        const filter = {_id: bookHeadId}
        const update = {$inc: {so_luong_kha_dung: 1}}
        let bookHead = await BookHead.findOneAndUpdate(filter, update , {useFindAndModify: false})
    }
    //delete book-registration
    await BookRegistration.findByIdAndRemove(bookRegistrationId, {useFindAndModify: false}).exec();
}

//update book-registration status 
async function updateBookRegistrationStatus(bookRegistrationId){
    const filter = {_id: bookRegistrationId}
    const update = {tinh_trang: true}
    await BookRegistration.findOneAndUpdate(filter, update, {useFindAndModify: false})
}

//create borrow-return-card & update book status
async function createBorrowReturnCard(bookRegistrationId){
    const bookRegistration = await BookRegistration.findById(bookRegistrationId)
    for await (const bookHeadId of bookRegistration.cac_dau_sach){
        let bookHead = await BookHead.findById(bookHeadId)
        for await (const book of bookHead.cac_quyen_sach){
            if(book.tinh_trang == true){ 
                // create new borrow-return-card
                createNewBorrowReturnCard(bookRegistration.ma_doc_gia, book._id)
                // update book status
                updateBookStatus(bookHeadId, book._id)
                break
            }
        }
    }
}

module.exports={
    deleteOverdueBookRegistration,
    getAllBookRegistration,
    deleteBookRegistration,
    updateBookRegistrationStatus,
    createBorrowReturnCard
}

//-------subfunction--------
// update book status
async function updateBookStatus(bookHeadId, bookId){
    const filter = {_id: bookHeadId, "cac_quyen_sach._id": bookId}
    const update = {"cac_quyen_sach.$.tinh_trang": false}
    await BookHead.findOneAndUpdate(filter, update, {useFindAndModify: false}).exec()
}

//create borrow-return-card
async function createNewBorrowReturnCard(readerID, bookId){
    let borrowReturnCard = new BorrowReturnCard({
        ma_doc_gia: readerID,
        ma_sach: bookId,
        ngay_muon: null, 
        ngay_tra: null,
        so_ngay_tra_tre: 0,
        tinh_trang: 0, 
    })
    await borrowReturnCard.save()
}

