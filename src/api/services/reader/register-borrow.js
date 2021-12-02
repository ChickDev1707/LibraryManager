
const BookHead = require('../../models/book-head.js')
const BorrowReturnCard = require('../../models/borrow-return-card.js')
const Reader = require('../../models/reader.js')
const RegisterBorrowCard = require('../../models/register-borrow-card.js')
const accountServices = require('../../services/account.js')
const policyServices = require('../../services/librarian/policy.js')

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
  const amountLimit = await policyServices.getPolicyValueByName('so_sach_muon_toi_da')
  const bookHead = await BookHead.findById(bookHeadId)
  const cart = account.gio_sach
  if(cart.includes(bookHeadId)) return 'Sách đã được đăng ký'
  if(cart.length>= amountLimit) return 'Quá số lượng sách quy định'
  if(Number(bookHead.so_luong_kha_dung)<= 0) return 'Sách không khả dụng'
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
  removeRegisterTicketsWithAccount(account, bookHeadIds)
  await account.save()
}

// register borrow
// -----------------------------------

async function getRegisterErrorMessage(req){
  const bookHeadIds = JSON.parse(req.body.bookHeads)
  const account = await accountServices.getCurrentUserAccount(req)
  const reader = await Reader.findOne({email: account.ten_tai_khoan})
  const fineLimit = await policyServices.getPolicyValueByName('tien_no_toi_da')
  
  const borrowAndRegisterCheckError = await checkInBorrowAndRegister(reader._id, bookHeadIds, account.gio_sach)
  if(borrowAndRegisterCheckError != '') return borrowAndRegisterCheckError
  if(reader.tien_no > fineLimit) return 'Bạn đang nợ quá số tiền quy định'
  return ''
}

async function checkInBorrowAndRegister(readerId, bookHeadIds, bookCart){
  const amountLimit = await policyServices.getPolicyValueByName('so_sach_muon_toi_da')
  const activeRegisterCards = await RegisterBorrowCard.find({doc_gia: readerId, tinh_trang: 1})
  const borrowReturnCards = await BorrowReturnCard.find({doc_gia: readerId, ngay_tra: null})
  const registerBookHeads = activeRegisterCards.reduce((prev, cur)=>{
    return prev.concat(...cur.cac_dau_sach.map(bookHead=> bookHead.toString()))
  }, [])
  
  if(registerBookHeads.length + borrowReturnCards.length + bookCart.length > amountLimit) return 'Số sách mượn quá số lượng quy định'
  if(hasItemInArray(bookHeadIds, registerBookHeads) || hasItemInArray(bookHeadIds, registerBookHeads)) return 'Có sách đã được đăng ký hoặc mượn'
  return ''
}

function hasItemInArray(arr, container){
  for(item of arr){
    if(container.includes(item)) return true
  }
  return false
}

async function handleRegisterSuccess(req){
  const account = await accountServices.getCurrentUserAccount(req)
  const bookHeadIds = JSON.parse(req.body.bookHeads)
  const reader = await Reader.findOne({email: account.ten_tai_khoan})
  await handleSuccessWithCart(account, bookHeadIds)
  await addNewRegisterBorrowCard(reader._id, bookHeadIds)
  await saveNewNotification(reader.ho_ten)
  var io = req.app.get('socket-io');
  io.emit("new-notification", 'new notification');
}
async function handleSuccessWithCart(account, bookHeadIds){
  removeRegisterTicketsWithAccount(account, bookHeadIds)
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

// notification
async function saveNewNotification(readerName){
  let notification = createNewNotification(readerName)
  let librarianAccount = await accountServices.getLibrarianAccount()
  librarianAccount.thong_bao.push(notification)
  librarianAccount.thong_bao_moi = true
  await librarianAccount.save()
}
function createNewNotification(readerName){
  let not = {
    tieu_de: 'Đăng ký mượn sách',
    noi_dung: `Độc giả ${readerName} đã đăng ký mượn sách` 
  }
  return not
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