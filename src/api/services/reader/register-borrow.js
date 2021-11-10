
const BookHead = require('../../models/book-head.js')
const Reader = require('../../models/reader.js')
const RegisterBorrowCard = require('../../models/register-borrow-card.js')
const accountServices = require('../../services/account.js')

async function getBooksFromIds(bookHeadIds){
  let result = []
  for(let i = 0; i< bookHeadIds.length; i++){
    let book= await BookHead.findById(bookHeadIds[i])
    result.push(book)
  }
  return result
}

// cart
// -----------------------------------
async function getManageCartError(req){
  const bookHeadId = req.body.bookHeadId
  const account = await accountServices.getCurrentUserAccount(req)
  const cart = account.gio_sach
  if(cart.includes(bookHeadId)) return 'Sách đã được đăng ký'
  if(cart.length>= 5) return 'Quá hạn giỏ sách'
  return ''
}
async function saveBookHeadToCart(req){
  const bookHeadId = req.body.bookHeadId
  const account = await accountServices.getCurrentUserAccount(req)
  await account.gio_sach.push(bookHeadId)
  await account.save()
}
async function removeRegisterTickets(req, bookHeadIds){
  const account = await accountServices.getCurrentUserAccount(req)
  removeRegisterTicketsWithAccount(account)
  await account.save()
}

// register borrow
// -----------------------------------

async function getRegisterErrorMessage(req){
  const bookHeadIds = JSON.parse(req.body.bookHeads)
  const account = await accountServices.getCurrentUserAccount(req)
  const reader = await Reader.findOne({email: account.ten_tai_khoan})
  if(account.lich_su_dk.length + account.gio_sach.length > 5) return 'Số sách mượn quá quy định'
  if(existBookInRegisterHistory(account.lich_su_dk, bookHeadIds)) return 'Có sách đã được đăng ký hoặc mượn'
  
  let checkNotAvailable = await existBookHeadWithNoAvailable(bookHeadIds)
  if(checkNotAvailable) return 'Có đầu sách đã hết sách'
  if(reader.tong_no > 50000) return 'ban dang no qua quy dinh'
  return ''
}

function existBookInRegisterHistory(history, bookHeadIds){
  return bookHeadIds.reduce((check, bookHeadId)=> history.includes(bookHeadId) || check, false)
}
async function existBookHeadWithNoAvailable(bookHeadIds){
  for(i = 0; i< bookHeadIds.length; i++){
    let bookHead = await BookHead.findById(bookHeadIds[i])
    if(bookHead.so_luong_kha_dung<= 0) return true
  }
  return false;
}

async function handleRegisterSuccess(req){
  const account = await accountServices.getCurrentUserAccount(req)
  const bookHeadIds = JSON.parse(req.body.bookHeads)
  const reader = await Reader.findOne({email: account.ten_tai_khoan})
  await handleSuccessWithCart(account, bookHeadIds)
  await addNewRegisterBorrowCard(reader._id, bookHeadIds)
}
async function handleSuccessWithCart(account, bookHeadIds){
  removeRegisterTicketsWithAccount(account, bookHeadIds)
  account.lich_su_dk.push(...bookHeadIds)
  await account.save()
  await updateAvailableAmountOfBookHeads(bookHeadIds)
}

async function addNewRegisterBorrowCard(readerId, bookHeads){
  const newCard = new RegisterBorrowCard({
    doc_gia: readerId,
    cac_dau_sach: bookHeads,
  })
  await newCard.save();
}

async function updateAvailableAmountOfBookHeads(bookHeadIds){
  for(i = 0; i< bookHeadIds.length; i++){
    let bookHead = await BookHead.findById(bookHeadIds[i])
    bookHead.so_luong_kha_dung -= 1;
    await bookHead.save()
  }
}

async function searchRegisterCards(req){
  const currentUserAccount = await accountServices.getCurrentUserAccount(req)
  const currentReader = await Reader.findOne({email: currentUserAccount.ten_tai_khoan})
  let searchOptions = {doc_gia: currentReader._id}
  let reqStatus = req.query.status == undefined? -1: Number(req.query.status)

  if(reqStatus>= 0) searchOptions.tinh_trang = reqStatus
  const registerBorrowCards = await RegisterBorrowCard.find(searchOptions).populate('cac_dau_sach').exec()
  return registerBorrowCards
}
async function removeRegisterTicketsWithAccount(account, bookHeadIds){

  for(let i = 0; i< bookHeadIds.length; i++){
    let bookHeadId = bookHeadIds[i]
    const registerTicketIndex = account.gio_sach.indexOf(bookHeadId)
    await account.gio_sach.splice(registerTicketIndex, 1)
  }
  
}

module.exports = {
  getBooksFromIds,
  getManageCartError,
  saveBookHeadToCart,
  removeRegisterTickets,

  getRegisterErrorMessage,
  handleRegisterSuccess,
  searchRegisterCards
}