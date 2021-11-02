const Account = require('../../models/user-account.js')
const BookHead = require('../../models/book.js')
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
  const cart = currentUserAccount.gio_sach
  const bookHeadId = req.body.bookHeadId

  let errorMessage = getManageCartError(cart, bookHeadId)
  if(errorMessage == ''){
    await currentUserAccount.gio_sach.push(bookHeadId)
    await currentUserAccount.save()
    res.redirect('/book-head/'+ bookHeadId)
  }else{
    res.redirect('/book-head/'+ bookHeadId +'?errorMessage='+ encodeURIComponent(errorMessage))
  }
}

function getManageCartError(cart, bookHeadId){

  // book head already in cart
  if(cart.includes(bookHeadId)) return 'Sách đã được đăng ký'
  // cart contains less than five book
  if(cart.length>= 5) return 'Quá hạn giỏ sách'
  return ''
}

// register
async function registerBorrowBook(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  const currentReader = await Reader.findOne({email: currentUserAccount.ten_tai_khoan})
  const bookHeads = JSON.parse(req.body.bookHeads)

  let errorMessage = await getRegisterErrorMessage(currentUserAccount, currentReader, bookHeads)
  if(errorMessage == ''){
    await handleSuccessAddToCart(currentUserAccount, bookHeads)
    
    const newRegisterBorrowCard = new RegisterBorrowCard({
      ma_doc_gia: currentReader._id,
      cac_dau_sach: bookHeads,
    })
    await newRegisterBorrowCard.save()
    res.redirect('/reader/cart')

    // change available books amount
  }else{
    console.log(errorMessage)
  }
 
}
async function getRegisterErrorMessage(account, reader, bookHeadIds){
  
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

async function handleSuccessAddToCart(account, bookHeadIds){
  removeRegisterTickets(account, bookHeadIds)
  account.lich_su_dk.push(...bookHeadIds)
  await account.save()
  await updateAvailableAmountOfBookHeads(bookHeadIds)

}

async function updateAvailableAmountOfBookHeads(bookHeadIds){
  for(i = 0; i< bookHeadIds.length; i++){
    let bookHead = await BookHead.findById(bookHeadIds[i])
    bookHead.so_luong_kha_dung -= 1;
    await bookHead.save()
  }
}

async function deleteBookHeadFromCart(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  await removeRegisterTickets(currentUserAccount, [req.params.id])
  await currentUserAccount.save()
  res.redirect('/reader/cart')
}
async function deleteSelectedBookHeadFromCart(req, res){
  const currentUserAccount = await getCurrentUserAccount(req)
  const bookHeads = JSON.parse(req.body.bookHeads)
  await removeRegisterTickets(currentUserAccount, bookHeads)
  await currentUserAccount.save()
  res.redirect('/reader/cart')
}

async function removeRegisterTickets(account, bookHeadIds){
  for(let i = 0; i< bookHeadIds.length; i++){
    let bookHeadId = bookHeadIds[i]
    const registerTicketIndex = account.gio_sach.indexOf(bookHeadId)
    await account.gio_sach.splice(registerTicketIndex, 1)
  }
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