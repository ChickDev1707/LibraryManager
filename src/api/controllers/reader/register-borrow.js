const registerBorrowServices = require('../../services/reader/register-borrow.js')
const accountServices = require('../../services/account')
const urlHelper = require('../../helpers/url')

// cart
// ------------------------------
async function showCartPage(req, res){
  const user = await req.user;
  const bookHeads = await registerBorrowServices.getBooksFromIds(user.gio_sach)
  res.render('reader/cart.ejs', {bookHeads})
}
async function addNewBookHeadToCart(req, res){
  const bookHeadId = req.body.bookHeadId
  let errorMessage = await registerBorrowServices.getManageCartError(req)
  if(errorMessage == ''){
    registerBorrowServices.saveBookHeadToCart(req)
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${bookHeadId}/`, {
      type: 'success',
      message: 'Đã thêm sách vào vỏ đăng ký mượn'
    })
    res.redirect(redirectUrl)
  }else{
    const redirectUrl = urlHelper.getEncodedMessageUrl(`/book-head/${bookHeadId}/`, {
      type: 'error',
      message: errorMessage
    })
    res.redirect(redirectUrl)
  }
}
async function deleteBookHeadFromCart(req, res){
  await registerBorrowServices.removeRegisterTickets(req, [req.params.id])
  res.redirect('/reader/cart')
}
async function deleteSelectedBookHeadFromCart(req, res){
  const bookHeads = JSON.parse(req.body.bookHeads)
  await registerBorrowServices.removeRegisterTickets(req, bookHeads)
  res.redirect('/reader/cart')
}

// register borrow
// ------------------------------
async function registerBorrowBook(req, res){
  let errorMessage = await registerBorrowServices.getRegisterErrorMessage(req)
  if(errorMessage == ''){
    await registerBorrowServices.handleRegisterSuccess(req)
    res.redirect('/reader/cart')
  }else{
    console.log(errorMessage)
  }
  
}
async function showViewRegisterPage(req, res){
  const registerCards = await registerBorrowServices.searchRegisterCards(req)
  res.render('reader/view-register-card.ejs', {registerCards})
}


module.exports = {
  showCartPage,
  addNewBookHeadToCart,
  deleteBookHeadFromCart,
  deleteSelectedBookHeadFromCart,

  registerBorrowBook,
  showViewRegisterPage,
}