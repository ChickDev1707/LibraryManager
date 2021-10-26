const express = require('express');
const router = express.Router();
const authController = require('../controllers/librarian/auth.js')
const userAuth = require('../middlewares/user-auth.js')
const Account = require('../models/user-account.js')
const BookHead = require('../models/book-head.js')
const Reader = require('../models/reader.js')
const RegisterBorrowCard = require('../models/register-borrow-card.js')

// index
router.route('/').get(userAuth.checkAuthenticatedAsReader, (req, res)=>{
  res.render('reader/index.ejs')
})
// auth
router.delete('/logout', authController.logOut)

// register borrow book

router.get('/cart', async (req, res)=>{
  const user = await req.user;
  const bookHeads = await getBooksFromId(user.gio_sach)
  res.render('reader/cart.ejs', {bookHeads})
})

async function getBooksFromId(bookHeadIds){
  let result = []
  for(let i = 0; i< bookHeadIds.length; i++){
    let book= await BookHead.findById(bookHeadIds[i])
    result.push(book)
  }
  return result
}
// add new bookHeadId to account's book cart
router.post('/cart', async (req, res)=>{
  const user = await req.user;
  const currentUserAccount = await Account.findById(user._id)
  await currentUserAccount.gio_sach.push(req.body.bookHeadId)
  await currentUserAccount.save()
  res.redirect('/book-head/'+ req.body.bookHeadId)
})

// register 
router.post('/cart/register', async (req, res)=>{
  const user = await req.user;
  const currentUserAccount = await Account.findById(user._id)
  const currentReader = await Reader.findOne({email: user.ten_tai_khoan})
  await removeRegisterTickets(currentUserAccount, req.body.bookHeads)

  const newRegisterBorrowCard = new RegisterBorrowCard({
    ma_doc_gia: currentReader._id,
    cac_dau_sach: JSON.parse(req.body.bookHeads)
  })
  await newRegisterBorrowCard.save()
  res.redirect('/reader/cart')
 
})
// delete register book 
router.delete('/cart/register-tickets/:id', async (req, res)=>{
  const user = await req.user
  const currentUserAccount = await Account.findById(user._id)
  await removeRegisterTickets(currentUserAccount, [req.params.id])
  res.redirect('/reader/cart')
})

router.delete('/cart/register-tickets', async (req, res)=>{
  const user = await req.user
  const currentUserAccount = await Account.findById(user._id)
  const bookHeads = JSON.parse(req.body.bookHeads)
  await removeRegisterTickets(currentUserAccount, bookHeads)
  res.redirect('/reader/cart')
})

async function removeRegisterTickets(account, bookHeadIds){
  for(let i = 0; i< bookHeadIds.length; i++){
    let bookHeadId = bookHeadIds[i]
    const registerTicketIndex = account.gio_sach.indexOf(bookHeadId)
    await account.gio_sach.splice(registerTicketIndex, 1)
  }
  await account.save()
}

module.exports = router;