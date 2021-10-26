const Account = require('../../models/user-account.js')
const BookHead = require('../../models/book-head.js')
const Reader = require('../../models/reader.js')
const RegisterBorrowCard = require('../../models/register-borrow-card.js')

// cart
async function showCartPage(req, res){
  const user = await req.user;
  const bookHeads = await getBooksFromIds(user.gio_sach)
  res.render('reader/cart.ejs', {bookHeads})
}
async function getBooksFromIds(bookHeadIds){
  let result = []
  for(let i = 0; i< bookHeadIds.length; i++){
    let book= await BookHead.findById(bookHeadIds[i])
    result.push(book)
  }
  return result
}

async function addNewBookHeadToCart(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  let errorMessage = getManageCartError(currentUserAccount.gio_sach, req.body.bookHeadId)
  if(errorMessage == ''){
    await currentUserAccount.gio_sach.push(req.body.bookHeadId)
    await currentUserAccount.save()
    res.redirect('/book-head/'+ req.body.bookHeadId)
  }else{
    res.redirect('/book-head/'+ req.body.bookHeadId +'?errorMessage='+ encodeURIComponent(errorMessage))
  }
}

function getManageCartError(cart, bookHeadId){
  // book head already in cart
  if(cart.includes(bookHeadId)) return 'Sách đã được đăng ký'
  // cart contains less than five book
  if(cart.length>= 5) return 'Đã đăng ký quá số sách quy định'
  return ''
}
function isBookInCart(cart, bookHeadId){
  return cart.includes(bookHeadId)
}

// register
async function registerBorrowBook(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  const currentReader = await Reader.findOne({email: user.ten_tai_khoan})
  await removeRegisterTickets(currentUserAccount, req.body.bookHeads)

  const newRegisterBorrowCard = new RegisterBorrowCard({
    ma_doc_gia: currentReader._id,
    cac_dau_sach: JSON.parse(req.body.bookHeads)
  })
  await newRegisterBorrowCard.save()
  res.redirect('/reader/cart')
 
}
function getRegisterErrorMessage(){
  // requirement 1
  // requirement 2

}

async function deleteBookHeadFromCart(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  await removeRegisterTickets(currentUserAccount, [req.params.id])
  res.redirect('/reader/cart')
}
async function deleteSelectedBookHeadFromCart(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  const bookHeads = JSON.parse(req.body.bookHeads)
  await removeRegisterTickets(currentUserAccount, bookHeads)
  res.redirect('/reader/cart')
}

async function removeRegisterTickets(account, bookHeadIds){
  for(let i = 0; i< bookHeadIds.length; i++){
    let bookHeadId = bookHeadIds[i]
    const registerTicketIndex = account.gio_sach.indexOf(bookHeadId)
    await account.gio_sach.splice(registerTicketIndex, 1)
  }
  await account.save()
}

async function getCurrentUserAccount(req){
  const user = await req.user
  const currentUserAccount = await Account.findById(user._id)
  return currentUserAccount
}

module.exports = {
  showCartPage,
  addNewBookHeadToCart,
  registerBorrowBook,
  deleteBookHeadFromCart,
  deleteSelectedBookHeadFromCart
}