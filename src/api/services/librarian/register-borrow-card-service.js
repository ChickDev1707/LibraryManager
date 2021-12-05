const Reader = require('../../models/reader.js')
const RegisterBorrowCard = require('../../models/register-borrow-card.js')
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const BookHead = require('../../models/book-head.js')
const Account = require('../../models/user-account')
const policyService = require('../../services/librarian/policy.js')
const Policy = require('../../models/policy.js')

// confirm register borrow
async function getUnconfirmedRegisterBorrowCard(){
  let registerBorrowCard = await RegisterBorrowCard.find({tinh_trang: 0})
    .populate('doc_gia')
    .populate('cac_dau_sach')
    .sort({ngay_dang_ky: 1})
    .exec()
  return registerBorrowCard
}

async function updateRegisterBorrowCardStatus(registerBorrowCardId, status){
  const filter = {_id: registerBorrowCardId}
  const update = {tinh_trang: status}
  await RegisterBorrowCard.findOneAndUpdate(filter, update, {useFindAndModify: false})
}

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


async function denyRegisterBorrowCard(registerBorrowCardId){
  //update quantity available of book-head
  let registerBorrowCard = await RegisterBorrowCard.findById(registerBorrowCardId)
  for await(const bookHeadId of registerBorrowCard.cac_dau_sach){
    const filter = {_id: bookHeadId}
    const update = {$inc: {so_luong_kha_dung: 1}}
    let bookHead = await BookHead.findOneAndUpdate(filter, update , {useFindAndModify: false})
  }

  //deny RegisterBorrowCard
  await RegisterBorrowCard.findOneAndUpdate({_id: registerBorrowCardId},{tinh_trang: 2}).exec();
}


async function updateBookStatus(bookHeadId, bookId){
  const filter = {_id: bookHeadId, "cac_quyen_sach._id": bookId}
  const update = {"cac_quyen_sach.$.tinh_trang": false}
  await BookHead.findOneAndUpdate(filter, update, {useFindAndModify: false}).exec()
}

async function createNewBorrowReturnCard(readerID, bookHeadID, bookId){
  let borrowReturnCard = new BorrowReturnCard({
    doc_gia: readerID,
    dau_sach: bookHeadID,
    ma_sach: bookId,
    ngay_tra: null,
    so_ngay_tra_tre: 0,
  })
  await borrowReturnCard.save()
}

// notification
async function saveNewNotification(registerBorrowCardId, not){
  let registerBorrowCard = await RegisterBorrowCard.findById(registerBorrowCardId).populate('doc_gia')
  let a = registerBorrowCard.doc_gia.email
  let readerAccount = await Account.findOne({ten_tai_khoan: registerBorrowCard.doc_gia.email})

  readerAccount.thong_bao.unshift(not)
  readerAccount.thong_bao_moi = true
  await readerAccount.save()
}

module.exports={
  getUnconfirmedRegisterBorrowCard,
  updateRegisterBorrowCardStatus,
  createBorrowReturnCard,
  denyRegisterBorrowCard,
  saveNewNotification
  // denyOverdueRegisterBorrowCard, 
}

