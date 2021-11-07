const Reader = require('../../models/reader.js')
const RegisterBorrowCard = require('../../models/register-borrow-card.js')
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const BookHead = require('../../models/book-head.js');


// delete overdue RegisterBorrowCard
async function deleteOverdueRegisterBorrowCard(){
    let date = new Date();
    date.setDate(date.getDate()-3)
    //update all quantity available of book-head before delete overdue RegisterBorrowCard
    let registerBorrowCards = await RegisterBorrowCard.find({ngay_dang_ky: {$lte: date}, tinh_trang: 0})
    for await (const registerBorrowCard of registerBorrowCards){
        for await (const bookHeadId of registerBorrowCard.cac_dau_sach){
            const filter = {_id: bookHeadId}
            const update = {$inc: {so_luong_kha_dung: 1}}
            await BookHead.findOneAndUpdate(filter, update, {useFindAndModify: false})
        }
    }
    // delete all overdue RegisterBorrowCard
    const filter = {ngay_dang_ky: {$lte: date}, tinh_trang: 0}
    await RegisterBorrowCard.find(filter).deleteMany().exec()
}

//get all RegisterBorrowCard
async function getAllRegisterBorrowCard(){
    let registerBorrowCard = await RegisterBorrowCard.find({tinh_trang: 0})
        .populate('doc_gia')
        .populate('cac_dau_sach')
        .sort({ngay_dang_ky: 1})
        .exec()
    return registerBorrowCard
}

// delete RegisterBorrowCard
async function deleteRegisterBorrowCard(registerBorrowCardId){
    //update quantity available of book-head
    let registerBorrowCard = await RegisterBorrowCard.findById(registerBorrowCardId)
    for await(const bookHeadId of registerBorrowCard.cac_dau_sach){
        const filter = {_id: bookHeadId}
        const update = {$inc: {so_luong_kha_dung: 1}}
        let bookHead = await BookHead.findOneAndUpdate(filter, update , {useFindAndModify: false})
    }
    //delete RegisterBorrowCard
    await RegisterBorrowCard.findByIdAndRemove(registerBorrowCardId, {useFindAndModify: false}).exec();
}

//update RegisterBorrowCard status 
async function updateRegisterBorrowCardStatus(registerBorrowCardId){
    const filter = {_id: registerBorrowCardId}
    const update = {tinh_trang: 1}
    await RegisterBorrowCard.findOneAndUpdate(filter, update, {useFindAndModify: false})
}

//create borrow-return-card & update book status
async function createBorrowReturnCard(registerBorrowCardId){
    const registerBorrowCard = await RegisterBorrowCard.findById(registerBorrowCardId)
    for await (const bookHeadId of registerBorrowCard.cac_dau_sach){
        let bookHead = await BookHead.findById(bookHeadId)
        for await (const book of bookHead.cac_quyen_sach){
            if(book.tinh_trang == true){ 
                // create new borrow-return-card
                createNewBorrowReturnCard(registerBorrowCard.doc_gia, bookHeadId, book._id)
                // update book status
                updateBookStatus(bookHeadId, book._id)
                break
            }
        }
    }
}

module.exports={
    deleteOverdueRegisterBorrowCard,
    getAllRegisterBorrowCard,
    deleteRegisterBorrowCard,
    updateRegisterBorrowCardStatus,
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
async function createNewBorrowReturnCard(readerID, bookHeadID, bookId){
    let borrowReturnCard = new BorrowReturnCard({
        doc_gia: readerID,
        dau_sach: bookHeadID,
        ma_sach: bookId,
        ngay_muon: null, 
        ngay_tra: null,
        so_ngay_tra_tre: 0,
        tinh_trang: 0, 
    })
    await borrowReturnCard.save()
}

